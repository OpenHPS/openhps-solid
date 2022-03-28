<template>
    <b-modal
        :active="true"
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-label="Solid Login"
        close-button-aria-label="Close"
        aria-modal>
        <template #default="props">
            <form action="">
                <div class="modal-card" style="min-width: 400px">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Login</p>
                        <button
                            type="button"
                            class="delete"
                            @click="props.close"/>
                    </header>
                    <section class="modal-card-body">
                        <b-field label="WebID">
                            <b-input
                                type="text"
                                :value="webid"
                                placeholder="Your WebID"
                                required>
                            </b-input>
                        </b-field>
                    </section>
                    <footer class="modal-card-foot">
                        <b-button
                            label="Close"
                            @click="props.close" />
                        <b-button
                            label="Login"
                            type="is-primary"
                            @click="login" />
                    </footer>
                </div>
            </form>
        </template>
    </b-modal>
</template>

<script>
export default {
    name: 'LoginModel',
    props: ['webid', 'canCancel', 'controller'],
    data () {
        return {

        }
    },
    methods: {
        login() {
            this.controller.login(this.webid);
            this.controller.initialize();
        }
    }
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/all";
</style>
