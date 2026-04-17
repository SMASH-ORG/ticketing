import {useEffect} from "react";
import doRequest from "../../hooks/use-request";
import Router from "next/router";

export default () => {
    const [doSignOut, errors] = doRequest({
        url: '/api/users/signout', method: 'post', body: {}, onSuccess: () => {
            return Router.push('/');
        }
    });

    useEffect(() => {
        doSignOut();
    }, []);

    return <div>Signing you out...</div>
}