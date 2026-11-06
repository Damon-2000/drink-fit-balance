import axios from 'axios'
import { apiConfig } from '@/config'

export const http = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 5000,
})
