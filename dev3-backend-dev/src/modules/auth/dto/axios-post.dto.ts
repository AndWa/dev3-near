import { AxiosRequestConfig } from 'axios';

export class AxiosPostDto {
  url: string;
  payload: any;
  config?: AxiosRequestConfig<any>;
}
