import 'dotenv/config'
import * as zod from 'zod'

const envSchema = zod.object({
  NODE_ENV: zod.enum(['dev', 'test', 'production']).default('dev'),
  PORT: zod.coerce.number().default(3333),
  JWT_SECRET: zod.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data