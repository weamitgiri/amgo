import { Request, Response } from 'express';
/**
 * Get all active packages
 */
export declare const getPackages: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get CMS pages (published only)
 */
export declare const getCmsPages: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get a specific CMS page by slug
 */
export declare const getCmsPageBySlug: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get site settings (public subset only).
 *
 * Payment configuration is deliberately absent — checkout reads what it needs
 * from /v1/public/payment-methods, which exposes the Razorpay key id (public by
 * design) and nothing else.
 */
export declare const getSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get list of active activities (games)
 */
export declare const getGames: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get specific game details with its sub-games/variations
 */
export declare const getGameDetails: (req: Request, res: Response, next: import("express").NextFunction) => void;
