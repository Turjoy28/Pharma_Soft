import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './src/mockServer/node.js'

// 1. Start intercepting network requests before running tests
beforeAll(() => server.listen())

// 2. Reset any runtime request handlers added during tests to keep tests isolated
afterEach(() => server.resetHandlers())

// 3. Stop intercepting after all tests finish
afterAll(() => server.close())
