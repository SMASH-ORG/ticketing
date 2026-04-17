const OrderIndex = ({ orders }) => {
    return (
        <ul className={"list-group list-group-flush"}>
            {orders.map(order => {
                return (
                    <li className={"list-group-item"} key={order.id}>
                        {order.ticket.title} - {order.status}
                    </li>
                );
            })}
        </ul>
    );
}
OrderIndex.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders');
    return { orders: data };
}
export default OrderIndex;