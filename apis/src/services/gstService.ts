/**
 * Indian GST helpers: Place-of-Supply resolution, the CGST/SGST vs IGST split,
 * and amount-in-words. Pure functions with no DB or request access, so they are
 * easy to unit-test and are the single source of truth for the GST breakdown
 * used at checkout, in the stored snapshot, and on the invoice.
 *
 * The state → code table is the statutory GST state code list (nothing is
 * invented); common abbreviations map to the same canonical state.
 */

/** Official GST state/UT codes. */
const STATE_CODES: Record<string, string> = {
    'jammu and kashmir': '01',
    'himachal pradesh': '02',
    'punjab': '03',
    'chandigarh': '04',
    'uttarakhand': '05',
    'haryana': '06',
    'delhi': '07',
    'rajasthan': '08',
    'uttar pradesh': '09',
    'bihar': '10',
    'sikkim': '11',
    'arunachal pradesh': '12',
    'nagaland': '13',
    'manipur': '14',
    'mizoram': '15',
    'tripura': '16',
    'meghalaya': '17',
    'assam': '18',
    'west bengal': '19',
    'jharkhand': '20',
    'odisha': '21',
    'chhattisgarh': '22',
    'madhya pradesh': '23',
    'gujarat': '24',
    'daman and diu': '25',
    'dadra and nagar haveli and daman and diu': '26',
    'maharashtra': '27',
    'andhra pradesh': '37', // post-reorg AP
    'karnataka': '29',
    'goa': '30',
    'lakshadweep': '31',
    'kerala': '32',
    'tamil nadu': '33',
    'puducherry': '34',
    'andaman and nicobar islands': '35',
    'telangana': '36',
    'ladakh': '38',
    'other territory': '97',
};

/** Common short forms and spelling variants → canonical state name. */
const STATE_ALIASES: Record<string, string> = {
    'jk': 'jammu and kashmir',
    'j&k': 'jammu and kashmir',
    'hp': 'himachal pradesh',
    'pb': 'punjab',
    'uk': 'uttarakhand',
    'ua': 'uttarakhand',
    'uttaranchal': 'uttarakhand',
    'hr': 'haryana',
    'dl': 'delhi',
    'new delhi': 'delhi',
    'rj': 'rajasthan',
    'up': 'uttar pradesh',
    'br': 'bihar',
    'wb': 'west bengal',
    'jh': 'jharkhand',
    'or': 'odisha',
    'orissa': 'odisha',
    'cg': 'chhattisgarh',
    'chattisgarh': 'chhattisgarh',
    'mp': 'madhya pradesh',
    'gj': 'gujarat',
    'mh': 'maharashtra',
    'ap': 'andhra pradesh',
    'ka': 'karnataka',
    'ga': 'goa',
    'kl': 'kerala',
    'tn': 'tamil nadu',
    'ts': 'telangana',
    'tg': 'telangana',
    'py': 'puducherry',
    'pondicherry': 'puducherry',
};

const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
    Object.entries(STATE_CODES).map(([name, code]) => [code, name])
);

const titleCase = (s: string) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, 'and');

export interface ResolvedState {
    name: string; // canonical, title-cased
    code: string; // 2-digit GST state code
}

/**
 * Resolves a free-text state (full name, abbreviation, or a 2-digit code) to its
 * canonical name and GST state code. Returns null when it can't be matched, so
 * the caller can decide how to treat an unknown Place of Supply.
 */
export function resolveState(input: string | null | undefined): ResolvedState | null {
    if (!input) return null;
    const raw = String(input).trim();
    if (!raw) return null;

    // A 2-digit statutory code.
    if (/^\d{2}$/.test(raw) && CODE_TO_NAME[raw]) {
        return { name: titleCase(CODE_TO_NAME[raw]), code: raw };
    }

    const key = raw.toLowerCase().replace(/\s+/g, ' ');
    if (STATE_CODES[key]) return { name: titleCase(key), code: STATE_CODES[key] };
    if (STATE_ALIASES[key]) {
        const canonical = STATE_ALIASES[key];
        return { name: titleCase(canonical), code: STATE_CODES[canonical] };
    }
    return null;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export type TaxType = 'intra' | 'inter';

export interface GstBreakdown {
    taxableValue: number;
    gstRate: number; // total GST %, e.g. 18
    taxType: TaxType;
    isIntraState: boolean;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    total: number;
    placeOfSupply: string; // canonical buyer state name (or the raw input)
    placeOfSupplyCode: string; // GST state code, '' when unknown
}

/**
 * Computes the GST breakdown for a taxable supply.
 *
 * Place of Supply for these online services is the recipient's location — taken
 * from the customer's billing state, NOT their IP. The supply is intra-state
 * only when the buyer's and supplier's GST state codes are both known and equal;
 * anything else (including an unknown buyer state) is treated as inter-state so
 * a single IGST line is charged rather than wrongly splitting CGST/SGST.
 */
export function computeGst(params: {
    taxableValue: number;
    gstRate: number;
    buyerState: string | null | undefined;
    sellerStateCode: string | null | undefined;
}): GstBreakdown {
    const taxable = round2(Number.isFinite(params.taxableValue) ? params.taxableValue : 0);
    const rate = Number.isFinite(params.gstRate) && params.gstRate >= 0 ? params.gstRate : 0;

    const buyer = resolveState(params.buyerState);
    const sellerCode = (params.sellerStateCode || '').trim();

    const isIntraState = !!buyer && !!sellerCode && buyer.code === sellerCode;

    const totalGst = round2((taxable * rate) / 100);
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    if (isIntraState) {
        cgst = round2(totalGst / 2);
        sgst = round2(totalGst - cgst); // keep cgst + sgst === totalGst exactly
    } else {
        igst = totalGst;
    }

    return {
        taxableValue: taxable,
        gstRate: rate,
        taxType: isIntraState ? 'intra' : 'inter',
        isIntraState,
        cgst,
        sgst,
        igst,
        totalGst,
        total: round2(taxable + totalGst),
        placeOfSupply: buyer?.name || (params.buyerState ? String(params.buyerState).trim() : ''),
        placeOfSupplyCode: buyer?.code || '',
    };
}

// ---------------------------------------------------------------------------
// Amount in words (Indian numbering)
// ---------------------------------------------------------------------------

const ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitsToWords(n: number): string {
    if (n < 20) return ONES[n];
    return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim();
}

function belowThousand(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const parts: string[] = [];
    if (hundred) parts.push(ONES[hundred] + ' Hundred');
    if (rest) parts.push(twoDigitsToWords(rest));
    return parts.join(' ').trim();
}

/** Integer to Indian-system words (crore/lakh/thousand). */
function integerToWords(num: number): string {
    if (num === 0) return 'Zero';
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const below = num % 1000;
    const parts: string[] = [];
    if (crore) parts.push(integerToWords(crore) + ' Crore');
    if (lakh) parts.push(belowThousand(lakh) + ' Lakh');
    if (thousand) parts.push(belowThousand(thousand) + ' Thousand');
    if (below) parts.push(belowThousand(below));
    return parts.join(' ').trim();
}

/** "Rupees One Thousand One Hundred Eighty and Paise Fifty Only" */
export function amountInWords(amount: number): string {
    const safe = Math.max(0, round2(Number.isFinite(amount) ? amount : 0));
    const rupees = Math.floor(safe);
    const paise = Math.round((safe - rupees) * 100);
    let words = `Rupees ${integerToWords(rupees)}`;
    if (paise > 0) words += ` and Paise ${twoDigitsToWords(paise)}`;
    return words + ' Only';
}
