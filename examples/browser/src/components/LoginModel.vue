<template>
    <b-modal
        :active="!this.isLoggedIn()"
        has-modal-card
        aria-role="dialog"
        aria-label="Solid Login"
        aria-modal>
        <form action="">
            <div class="modal-card" style="min-width: 400px">
                <header class="modal-card-head">
                    <p class="modal-card-title">Login to Solid Provider</p>
                </header>
                <section class="modal-card-body">
                    <b-field label="OIDC Issuer">
                        <b-input
                            type="text"
                            v-model="issuer"
                            placeholder="Your OIDC Issuer"
                            required>
                        </b-input>
                    </b-field>
                </section>
                <footer class="modal-card-foot">
                    <b-button
                        label="Login"
                        type="is-primary"
                        @click="login" />
                </footer>
            </div>
        </form>
    </b-modal>
</template>

<script>
export default {
    name: 'LoginModel',
    props: ['controller'],
    data () {
        return {
            issuer: null
        }
    },
    methods: {
        login() {
            this.controller.login(this.issuer);
        },
        isLoggedIn() {
            console.log(this.controller ? this.controller.isLoggedIn : false)
            return this.controller ? this.controller.isLoggedIn : false;
        }
    },
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/all";
</style>
