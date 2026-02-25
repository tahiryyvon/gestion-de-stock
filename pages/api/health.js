export default function Health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: 'connected'
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}