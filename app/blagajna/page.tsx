import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckoutForm from './checkout-form';
import CartSummary from './cart-summary';

export const metadata = {
  title: 'Narudžba | FESB Racing Merch',
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="bg-brand h-6 w-1.5 rounded-full" aria-hidden />
        <h1 className="text-3xl font-bold">Narudžba</h1>
      </div>

      <div className="flex flex-col gap-6">
        <CartSummary />

        <Card>
          <CardHeader>
            <CardTitle>Tvoji podaci</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
