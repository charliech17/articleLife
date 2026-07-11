export type SponsorType = 'ONE_TIME' | 'RECURRING';
export type SponsorStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface ISponsorCheckoutDTO {
  amount: number;
  type: SponsorType;
  sponsorName?: string | null;
  email?: string | null;
  message?: string | null;
}

/** 後端回傳綠界託管付款頁的表單參數，前端組 hidden form POST 過去 */
export interface ISponsorCheckoutResponse {
  actionUrl: string;
  params: Record<string, string>;
}

export interface ISponsorOrderStatus {
  merchantTradeNo: string;
  amount: number;
  type: SponsorType;
  status: SponsorStatus;
  paidAt: string | null;
}

/** 管理端訂單（對應後端 SponsorOrderVO） */
export interface ISponsorOrder {
  id: number;
  merchantTradeNo: string;
  sponsorName: string | null;
  email: string | null;
  message: string | null;
  amount: number;
  type: SponsorType;
  status: SponsorStatus;
  ecpayTradeNo: string | null;
  paymentType: string | null;
  totalSuccessTimes: number | null;
  ip: string | null;
  createdAt: string;
  paidAt: string | null;
}
