export const INPUT = "block w-full mt-1.5 px-3 py-[11px] text-ink border-2 border-ink/80 rounded-[10px] bg-white focus:border-orange focus:outline-none";
export const LABEL = "block font-semibold mb-3.5";
export const BTN = "inline-flex items-center justify-center gap-2 bg-orange text-ink font-bold px-6 py-3 rounded-full cursor-pointer shadow-[0_6px_16px_rgba(242,106,27,0.35)] hover:-translate-y-0.5 hover:bg-orange-light transition-all disabled:opacity-60 disabled:cursor-default disabled:hover:translate-y-0";
export const BTN_SM = BTN.replace("px-6 py-3", "px-4 py-2 text-sm");
export const BTN_GHOST = "inline-flex items-center justify-center gap-2 border-2 border-ink text-ink font-bold px-4 py-2 text-sm rounded-full cursor-pointer hover:bg-blue-light transition-colors";
export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
