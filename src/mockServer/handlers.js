import { http, HttpResponse } from 'msw/http'
import msDB from './msDB.js'

export const handlers = [
    http.get('https://api.pharmaDashboard.com/user', () => {
        return HttpResponse.json({ users: msDB });
    }),
]