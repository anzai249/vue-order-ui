<template>
    <a-row type="flex" justify="center" align="middle" style="height: 100vh;">
        <a-col :span="8">
            <a-card title="管理員登入">
                <a-form @submit.prevent="handleSubmit">
                    <a-form-item>
                        <a-input v-model="form.username" placeholder="Username" />
                    </a-form-item>
                    <a-form-item>
                        <a-input v-model="form.password" type="password" placeholder="Password" />
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" html-type="submit" block>登入</a-button>
                    </a-form-item>
                </a-form>
            </a-card>
        </a-col>
    </a-row>
</template>

<script>
import {message} from "ant-design-vue";

export default {
    data() {
        return {
            form: {
                username: '',
                password: ''
            }
        };
    },
    created() {
        if (sessionStorage.getItem('adminToken')) {
            this.$router.push('/admin');
        }
    },
    methods: {
        handleSubmit() {
            // auth linebot.sleepingbed.top/users/admin/login
            let adminAuth = 'Basic ' + btoa(this.form.username + ':' + this.form.password);
            fetch('https://linebot.sleepingbed.top/api/users/admin/login', {
                method: 'POST',
                headers: {
                    'Authorization': adminAuth
                }
            }).then(res => {
                if (res.ok) {
                    // store token
                    sessionStorage.setItem('adminToken', res.headers.get('Authorization'));
                    this.$router.push('/admin');
                } else {
                    message.error("登入失敗");
                }
            });

        }
    }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>