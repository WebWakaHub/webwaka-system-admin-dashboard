/**
 * Input Validation Middleware
 * 
 * Validates and sanitizes all user input using express-validator.
 * Prevents XSS, SQL injection, and other security vulnerabilities.
 * 
 * @module hospitality-booking-engine/api/middleware/input-validation
 * @author webwakaagent4
 */

import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './error-handler';

/**
 * Validate search booking request
 */
export const validateSearchBooking = [
  body('checkInDate')
    .trim()
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date')
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  
  body('checkOutDate')
    .trim()
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const checkInDate = new Date(req.body.checkInDate);
      const checkOutDate = new Date(value);
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  body('adultsCount')
    .isInt({ min: 1, max: 10 })
    .withMessage('Adults count must be between 1 and 10'),
  
  body('childrenCount')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Children count must be between 0 and 10'),
  
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
];

/**
 * Validate create booking request
 */
export const validateCreateBooking = [
  body('propertyId')
    .trim()
    .notEmpty()
    .withMessage('Property ID is required')
    .isString()
    .escape(),
  
  body('checkInDate')
    .trim()
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date'),
  
  body('checkOutDate')
    .trim()
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date'),
  
  body('adultsCount')
    .isInt({ min: 1, max: 10 })
    .withMessage('Adults count must be between 1 and 10'),
  
  body('childrenCount')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Children count must be between 0 and 10'),
  
  body('rooms')
    .isArray({ min: 1 })
    .withMessage('At least one room must be selected'),
  
  body('rooms.*.roomTypeId')
    .trim()
    .notEmpty()
    .withMessage('Room type ID is required')
    .escape(),
  
  body('rooms.*.ratePlanId')
    .trim()
    .notEmpty()
    .withMessage('Rate plan ID is required')
    .escape(),
  
  body('rooms.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Room quantity must be between 1 and 10'),
  
  body('guest.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .escape(),
  
  body('guest.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .escape(),
  
  body('guest.email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('guest.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+234[0-9]{10}$/)
    .withMessage('Phone number must be in format +234XXXXXXXXXX'),
  
  body('guest.ndprConsent')
    .isBoolean()
    .withMessage('NDPR consent must be a boolean')
    .custom((value) => {
      if (value !== true) {
        throw new Error('NDPR consent is required');
      }
      return true;
    }),
  
  body('paymentGateway')
    .trim()
    .notEmpty()
    .withMessage('Payment gateway is required')
    .isIn(['paystack', 'flutterwave', 'interswitch'])
    .withMessage('Payment gateway must be paystack, flutterwave, or interswitch'),
];

/**
 * Validate modify booking request
 */
export const validateModifyBooking = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Booking ID is required')
    .escape(),
  
  body('checkInDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date'),
  
  body('checkOutDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date'),
  
  body('adultsCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Adults count must be between 1 and 10'),
  
  body('childrenCount')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Children count must be between 0 and 10'),
  
  body('version')
    .isInt({ min: 1 })
    .withMessage('Version is required for optimistic locking'),
];

/**
 * Validate cancel booking request
 */
export const validateCancelBooking = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Booking ID is required')
    .escape(),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be between 10 and 500 characters')
    .escape(),
];

/**
 * Validate booking ID parameter
 */
export const validateBookingId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Booking ID is required')
    .escape(),
];

/**
 * Validate reference number parameter
 */
export const validateReferenceNumber = [
  param('referenceNumber')
    .trim()
    .notEmpty()
    .withMessage('Reference number is required')
    .matches(/^BK[A-Z0-9]+$/)
    .withMessage('Reference number must be in format BKXXXXXXXX'),
];

/**
 * Handle validation errors
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: (error as any).param,
      message: error.msg,
      value: (error as any).value,
    }));
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
}

export default {
  validateSearchBooking,
  validateCreateBooking,
  validateModifyBooking,
  validateCancelBooking,
  validateBookingId,
  validateReferenceNumber,
  handleValidationErrors,
};
