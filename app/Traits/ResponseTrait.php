<?php

namespace App\Traits;

trait ResponseTrait
{
	/**
	 * @param $data
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function createdResponse($data, $message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => false,
			'message' => (!empty($message) ? $message : 'success'),
			'data' => $data,
		];
		return response()->json($response, 201);
	}

	protected function errorResponse($data, $message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => (!empty($message) ? $message : 'error'),
			'data' => $data,
		];
		return response()->json($response, 201);
	}

	/**
	 * @param $data
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function showResponse($data, $message = null, $code = 0, $extraKeyValue = []) {
		$response = [
			'error' => false,
			'code' => $code,
			'message' => (!empty($message) ? $message : 'success'),
            'data' => $data,
		];
		foreach ($extraKeyValue as $key => $value) {
			$response[$key] = $value;
		}
		return response()->json($response, 200);
	}

	/***
     	* @param $data
     	* @return \Illuminate\Http\JsonResponse
	*/
	protected function listResponse($data, $message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => false,
			'message' => (!empty($message) ? $message : 'success'),
			'data' => $data,
		];
		return response()->json($response, 200);
	}
	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function deletedResponse($message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => false,
			'message' => (!empty($message) ? $message : 'delete'),
		];
		return response()->json($response, 200);
	}

	protected function notExistResponse($message = null, $code = 1) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => (!empty($message) ? $message : 'Not exists'),
		];
		return response()->json($response, 200);
	}
	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function notFoundResponse($e = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => $e->getMessage(),
		];
		return response()->json($response, 404);
	}

	/**
	 * @param $e
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function clientErrorResponse($e = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => $e->getMessage(),
		];
		return response()->json($response, 422);
	}

	/**
	 * @param $errors
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function validationErrorResponse($errors, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => $errors->errors()->first(),
		];
		return response()->json($response, 200);
	}

	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function unauthenticatedResponse($message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => 'Unauthenticated',
		];
		return response()->json($response, 401);
	}

	/**
	 * @return \Illuminate\Http\JsonResponse
	 */
	protected function notFoundResult($message = null, $code = 0) {
		$response = [
			'code' => $code,
			'error' => true,
			'message' => (!empty($message) ? $message : 'Resource Not Found'),
		];
		return response()->json($response, 200);
	}

	protected function outOfStockResponse($data, $message = null, $code = 0) {
		$response = [
			'code' => $code,
			'status' => 0,
			'error' => true,
			'message' => (!empty($message) ? $message : $data['message']),
			'data' => $data,
		];
		return response()->json($response, 200);
	}

	// new success resp.

	protected function testValidationErrorResponse($errors,$data = []) {
		$response = [
			'code' => 401,
			'message' => $errors->errors()->first(),
			//'data' => $data,
		];
		return response()->json($response, 401);
	}

	protected function testSuccessResponse($data, $message = null, $code = 0, $extraKeyValue = []) {
		$response = [
			'code' => (!empty($code) ? $code : 200),
			'message' => (!empty($message) ? $message : 'ok'),
            'data' => $data,
		];
		foreach ($extraKeyValue as $key => $value) {
			$response[$key] = $value;
		}
		return response()->json($response, 200);
	}

	protected function testNotFoundResult($data = 0, $message = null, $code = 401) {
		$response = [
			'code' => (!empty($code) ? $code : 401),
			'message' => (!empty($message) ? $message : 'Resource Not Found'),
			//'data' => $data,
		];
		return response()->json($response, $code);
	}

	protected function testClientErrorResponse($e = null, $code = 0) {
		$response = [
			'success' => 0,
			'err_msg' => $e->getMessage(),
			'data' => null
		];
		return response()->json($response, 422);
	}

	protected function testSuccess2Response($data, $message = null, $code = 0, $extraKeyValue = []) {
		$response = [
			'code' => 200,
			'message' => (!empty($message) ? $message : 'ok'),
		];
		return response()->json($response, 200);
	}
}