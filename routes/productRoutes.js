const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
// const upload = require('../middleware/upload');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, 'images-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage });

// Mahsulot yaratish
router.post('/products', upload.array('images', 10), productController.createProduct);

// Barcha mahsulotlarni olish
router.get('/', productController.getAllProducts);

// ID orqali mahsulot olish
router.get('/:id', productController.getProductById);

// ID orqali mahsulotni tahrirlash
router.put('/products/:id', upload.array('images', 10), productController.updateProduct);

// ID orqali mahsulotni o'chirish
router.delete('/:id', productController.deleteProduct);

module.exports = router;