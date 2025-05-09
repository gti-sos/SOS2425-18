import adapter from '@sveltejs/adapter-node';

const config = { kit: { adapter: adapter({
                        env: {
                            host: '0.0.0.0',
                            port: process.env.PORT || 3000
                        }
}) } };

export default config;
