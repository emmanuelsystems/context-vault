import express from 'express';
import vaultRouter from './routes/vault';
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/v1', vaultRouter);
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
export default app;
