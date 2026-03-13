"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bloodTests_1 = require("../controllers/bloodTests");
const router = (0, express_1.Router)();
router.post('/checkBloodTest', bloodTests_1.checkBloodTestNormal);
exports.default = router;
