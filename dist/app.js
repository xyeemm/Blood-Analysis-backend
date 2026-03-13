"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bloodTestRoutes_1 = __importDefault(require("./routes/bloodTestRoutes"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Server is running with Node + TypeScript 🚀');
});
app.use('/api', bloodTestRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
