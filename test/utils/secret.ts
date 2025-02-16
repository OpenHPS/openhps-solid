export function generate(uri: string, pod: string, email: string, password: string): Promise<{ id: string, secret: string, resource: string }> {
    return new Promise((resolve, reject) => {
        let accountToken: string;
        const tokenName = 'my-token';
        fetch(`${uri}/.account/`).then(response => {
            return response.json();
        }).then(({ controls }) => {
            return fetch(controls.password.login, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, password, name: tokenName }),
            });
        }).then(response => {
            return response.json();
        }).then(({ authorization  }) => {
            accountToken = authorization;
            return fetch(`${uri}/.account/`, {
                headers: { authorization: `CSS-Account-Token ${accountToken}` }
            });
        }).then((response) => {
            return response.json();
        }).then(({ controls }) => {
            return fetch(controls.account.clientCredentials, {
                method: 'POST',
                headers: { authorization: `CSS-Account-Token ${accountToken}`, 'content-type': 'application/json' },
                body: JSON.stringify({ name: tokenName, webId: `${uri}/${pod}/profile/card#me` }),
            });
        }).then((response) => {
            return response.json();
        }).then(resolve).catch(reject);
    });
}
