import {stripe} from "@/lib/stripe";
import {headers} from "next/headers";
import Stripe from "stripe";
import {db} from "@/db";
import {NextResponse} from "next/server";

export async function POST0(req: Request) {
    try {
        const body = await req.json()
        const signature = (await headers()).get('stripe-signature')

        if (!signature) {
            return new Response('No signature found', {status: 401})
        }

        const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            const email = session.customer_details?.email
            if (!email) throw new Error('No email found')

            const {userId, orderId} = session.metadata || {}
            if (!userId || !orderId) {
                throw new Error('No user or order id found')
            }

            const address = session.customer_details?.address
            const name = session.customer_details?.name

            if (!address || !name) {
                throw new Error('Missing address info from Stripe session')
            }


            await db.order.update({
                where: {id: orderId},
                data: {
                    isPaid: true,
                    shippingAddress: {
                        create: {
                            name,
                            city: address.city ?? '',
                            country: address.country ?? '',
                            postalCode: address.postal_code ?? '',
                            street: address.line1 ?? '',
                            state: address.state ?? '',
                        },
                    },
                    billingAddress: {
                        create: {
                            name,
                            city: address.city ?? '',
                            country: address.country ?? '',
                            postalCode: address.postal_code ?? '',
                            street: address.line1 ?? '',
                            state: address.state ?? '',
                        },
                    },
                },
            })
        }

            return NextResponse.json({result: event, ok: true})
    } catch (e) {
        console.error(e)

        return NextResponse.json({ok: false}, {status: 500})
    }
}
