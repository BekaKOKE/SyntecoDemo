import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * RFC 7807 Problem Details for HTTP APIs.
 * https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetail {
  /** A URI reference that identifies the problem type */
  type: string;
  /** A short, human-readable summary of the problem type */
  title: string;
  /** The HTTP status code */
  status: number;
  /** A human-readable explanation specific to this occurrence */
  detail: string;
  /** A URI reference that identifies the specific occurrence */
  instance?: string;
  /** Machine-readable error code for programmatic handling */
  errorCode: string;
  /** Additional context (field-level errors, etc.) */
  errors?: Record<string, string[]>;
  /** Request correlation ID */
  requestId?: string;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

/**
 * Standard error codes for the Synteco API.
 * Add new codes here as the API grows.
 */
export enum ErrorCode {
  // Auth
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  TOKEN_REVOKED = 'AUTH_TOKEN_REVOKED',
  EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  INSUFFICIENT_ROLE = 'AUTH_INSUFFICIENT_ROLE',
  ACCOUNT_DISABLED = 'AUTH_ACCOUNT_DISABLED',
  RATE_LIMITED = 'AUTH_RATE_LIMITED',

  // Products
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_DUPLICATE_SKU = 'PRODUCT_DUPLICATE_SKU',

  // Categories
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_HAS_CHILDREN = 'CATEGORY_HAS_CHILDREN',

  // Brands
  BRAND_NOT_FOUND = 'BRAND_NOT_FOUND',
  BRAND_NAME_EXISTS = 'BRAND_NAME_EXISTS',

  // Cart
  CART_EMPTY = 'CART_EMPTY',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',

  // Orders
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INVALID_TRANSITION = 'ORDER_INVALID_TRANSITION',
  ORDER_CANNOT_CANCEL = 'ORDER_CANNOT_CANCEL',

  // Inventory
  INSUFFICIENT_STOCK = 'INVENTORY_INSUFFICIENT_STOCK',
  STOCK_NOT_FOUND = 'INVENTORY_STOCK_NOT_FOUND',
  WAREHOUSE_NOT_FOUND = 'INVENTORY_WAREHOUSE_NOT_FOUND',

  // Pricing
  PRICE_NOT_FOUND = 'PRICE_NOT_FOUND',

  // Promotions
  PROMO_INVALID = 'PROMO_INVALID',
  PROMO_NOT_FOUND = 'PROMO_NOT_FOUND',
  PROMO_CODE_EXISTS = 'PROMO_CODE_EXISTS',
  DISCOUNT_STRATEGY_UNKNOWN = 'DISCOUNT_STRATEGY_UNKNOWN',

  // Payments
  PAYMENT_METHOD_UNSUPPORTED = 'PAYMENT_METHOD_UNSUPPORTED',
  PAYMENT_DETAILS_INVALID = 'PAYMENT_DETAILS_INVALID',
  ORDER_ALREADY_PAID = 'ORDER_ALREADY_PAID',

  // Order services (add-ons)
  ORDER_SERVICE_UNKNOWN = 'ORDER_SERVICE_UNKNOWN',

  // Notifications
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',

  // Inquiries
  INQUIRY_NOT_FOUND = 'INQUIRY_NOT_FOUND',

  // CRM
  DEAL_NOT_FOUND = 'DEAL_NOT_FOUND',

  // Users
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // General
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT',
}

/** Maps error codes to HTTP status codes */
export const ErrorCodeStatus: Record<string, HttpStatus> = {
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_INVALID]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.TOKEN_REVOKED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.INSUFFICIENT_ROLE]: HttpStatus.FORBIDDEN,
  [ErrorCode.ACCOUNT_DISABLED]: HttpStatus.FORBIDDEN,
  [ErrorCode.RATE_LIMITED]: HttpStatus.TOO_MANY_REQUESTS,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PRODUCT_DUPLICATE_SKU]: HttpStatus.CONFLICT,
  [ErrorCode.CATEGORY_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.CATEGORY_HAS_CHILDREN]: HttpStatus.CONFLICT,
  [ErrorCode.BRAND_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.BRAND_NAME_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.CART_EMPTY]: HttpStatus.BAD_REQUEST,
  [ErrorCode.CART_ITEM_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.ORDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.INVALID_TRANSITION]: HttpStatus.BAD_REQUEST,
  [ErrorCode.ORDER_CANNOT_CANCEL]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INSUFFICIENT_STOCK]: HttpStatus.BAD_REQUEST,
  [ErrorCode.STOCK_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.WAREHOUSE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PRICE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PROMO_INVALID]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ErrorCode.PROMO_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.PROMO_CODE_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.DISCOUNT_STRATEGY_UNKNOWN]: HttpStatus.BAD_REQUEST,
  [ErrorCode.PAYMENT_METHOD_UNSUPPORTED]: HttpStatus.BAD_REQUEST,
  [ErrorCode.PAYMENT_DETAILS_INVALID]: HttpStatus.BAD_REQUEST,
  [ErrorCode.ORDER_ALREADY_PAID]: HttpStatus.CONFLICT,
  [ErrorCode.ORDER_SERVICE_UNKNOWN]: HttpStatus.BAD_REQUEST,
  [ErrorCode.NOTIFICATION_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.INQUIRY_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.DEAL_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.IDEMPOTENCY_CONFLICT]: HttpStatus.CONFLICT,
};

/**
 * Base application exception with RFC 7807 support.
 * All domain exceptions should extend this.
 */
export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly errors?: Record<string, string[]>;

  constructor(
    errorCode: ErrorCode,
    detail: string,
    status?: HttpStatus,
    errors?: Record<string, string[]>,
  ) {
    const httpStatus = status ?? ErrorCodeStatus[errorCode] ?? HttpStatus.INTERNAL_SERVER_ERROR;
    super(
      {
        statusCode: httpStatus,
        errorCode,
        message: detail,
        errors,
      },
      httpStatus,
    );
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
