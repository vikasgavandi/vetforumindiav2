const { UserDocument, User } = require('../models');
const path = require('path');
const fs = require('fs');
const logger = require('../middleware/logger');

// Get user's own documents
const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await UserDocument.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        documentName: doc.documentName,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        documentPath: doc.documentPath,
        isVerified: doc.isVerified,
        uploadedAt: doc.createdAt
      }))
    });

  } catch (error) {
    logger.error('Get user documents error', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });

    res.status(500).json({
      error: 'Internal server error while fetching documents'
    });
  }
};

// Get all documents (Admin only)
const getAllDocuments = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
    }

    const documents = await UserDocument.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        user: doc.user,
        documentName: doc.documentName,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        documentPath: doc.documentPath,
        isVerified: doc.isVerified,
        uploadedAt: doc.createdAt
      }))
    });

  } catch (error) {
    logger.error('Get all documents error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Internal server error while fetching documents'
    });
  }
};

// Preview/Download document
const previewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    // Find the document
    const document = await UserDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Check permissions: user can only access their own documents, admin can access all
    if (!isAdmin && document.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied. You can only view your own documents.'
      });
    }

    // Construct file path
    const filePath = path.join(__dirname, '../../', document.documentPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Set appropriate headers for preview/download
    const fileName = document.documentName;
    res.setHeader('Content-Type', document.documentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('File streaming error', {
        error: error.message,
        documentId,
        filePath
      });
      res.status(500).json({
        error: 'Error streaming file'
      });
    });

  } catch (error) {
    logger.error('Preview document error', {
      error: error.message,
      stack: error.stack,
      documentId: req.params.documentId,
      userId: req.user.id
    });

    res.status(500).json({
      error: 'Internal server error while previewing document'
    });
  }
};

// Update document verification status (Admin only)
const updateDocumentVerification = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { documentId } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        error: 'isVerified must be a boolean value'
      });
    }

    const document = await UserDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    await document.update({ isVerified });

    logger.info('Document verification updated', {
      documentId,
      isVerified,
      adminId: req.user.id
    });

    res.json({
      message: 'Document verification status updated successfully',
      document: {
        id: document.id,
        documentName: document.documentName,
        isVerified: document.isVerified,
        updatedAt: document.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update document verification error', {
      error: error.message,
      stack: error.stack,
      documentId: req.params.documentId
    });

    res.status(500).json({
      error: 'Internal server error while updating document verification'
    });
  }
};

module.exports = {
  getUserDocuments,
  getAllDocuments,
  previewDocument,
  updateDocumentVerification
};