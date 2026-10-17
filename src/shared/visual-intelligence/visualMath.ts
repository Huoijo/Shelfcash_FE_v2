/** Display geometry only. Exact source amounts stay in feature-owned formatters. */
export type Fraction = { numerator: string; denominator: string }
export function sumFractions(values: (Fraction|null)[]):Fraction|null {
  if(values.some(value=>!value))return null
  try{return values.reduce<Fraction>((sum,value)=>{
    const d=BigInt(value!.denominator),n=BigInt(value!.numerator)
    if(d<=0n||n<0n)throw Error('Invalid nonnegative quantity')
    const sd=BigInt(sum.denominator)
    let a=sd,b=d
    while(b){const next=a%b;a=b;b=next}
    const common=sd/a*d
    return {numerator:String(BigInt(sum.numerator)*(common/sd)+n*(common/d)),denominator:String(common)}
  },{numerator:'0',denominator:'1'})}catch{return null}
}
export function decimalFraction(value: string | null | undefined): Fraction | null {
  if (value == null || !/^-?\d+(?:\.\d+)?$/.test(value)) return null
  const [integer, fraction = ''] = value.split('.')
  return { numerator: `${integer}${fraction}`, denominator: `1${'0'.repeat(fraction.length)}` }
}
export function proportion(value: Fraction | null | undefined, denominator: Fraction | null | undefined): number | null {
  if (!value || !denominator || !/^-?\d+$/.test(value.numerator) || !/^\d+$/.test(value.denominator) || !/^-?\d+$/.test(denominator.numerator) || !/^\d+$/.test(denominator.denominator)) return null
  const vn=BigInt(value.numerator), vd=BigInt(value.denominator), dn=BigInt(denominator.numerator), dd=BigInt(denominator.denominator)
  if (vn<0n || vd<=0n || dn<=0n || dd<=0n) return null
  const percent=Number(vn*dd*1000n/(vd*dn))/10
  return Number.isFinite(percent)?percent:null
}
export function decimalDelta(a: Fraction | undefined, b: Fraction | undefined): string | null {
  if (!a || !b) return null
  try {
    const ad=BigInt(a.denominator), bd=BigInt(b.denominator)
    if(ad<=0n||bd<=0n)return null
    const n=BigInt(a.numerator)*bd-BigInt(b.numerator)*ad, d=ad*bd
    const magnitude=n<0n?-n:n
    let remainder=magnitude%d, fraction=''
    while(remainder&&fraction.length<38){remainder*=10n;fraction+=String(remainder/d);remainder%=d}
    return `${n<0n?'-':''}${magnitude/d}${fraction?'.'+fraction:''}${remainder?'…':''}`
  } catch {return null}
}
