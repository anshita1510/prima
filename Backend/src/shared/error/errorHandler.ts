export const errorHandler = (err: Error, req: any, res: any, next: any) => {
    const statusCode = (err as any).statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
    })
}