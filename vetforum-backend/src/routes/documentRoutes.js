import express from 'express';
import {
  getUserDocuments,
  getAllDocuments,
  previewDocument,
  updateDocumentVerification
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All document routes require authentication
router.use(authenticateToken);

// Get user's own documents
router.get('/my', getUserDocuments);

// Get all documents (Admin only)
router.get('/all', getAllDocuments);

// Preview/Download document
router.get('/preview/:documentId', previewDocument);

// Update document verification status (Admin only)
router.put('/:documentId/verify', updateDocumentVerification);

export default router;