import courseRoutes from './courses';
import sessionRoutes from './sessions';
import userRoutes from './users';
import healthRoutes from './health';

const constructorMethod = (app) => {
    app.use('/courses', courseRoutes);
    app.use('/sessions', sessionRoutes);
    app.use('/users', userRoutes);
    app.use('/health', healthRoutes);

    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });
};

export default constructorMethod;