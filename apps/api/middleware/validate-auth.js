import { body, validationResult } from 'express-validator'

export const validateRegister = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  handleValidation,
]

export const validateLogin = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password is required.')
    .notEmpty().withMessage('Password cannot be empty.'),
  handleValidation,
]

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const friendly = errors.array().map(e => ({
      field: e.path,
      message: e.msg,
    }));

    const mainMsg =
      friendly[0]?.message ||
      'Some fields are invalid. Please check the form and try again.';

    return res.status(400).json({
      error: {
        code: 400,
        message: mainMsg,
        details: friendly,
      },
    });
  }

  next();
}
