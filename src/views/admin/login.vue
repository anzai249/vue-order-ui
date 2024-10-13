<template>
    <a-row type="flex" justify="center" align="middle" style="height: 100vh;">
        <a-col :span="8">
            <a-card title="管理員登入">
                <a-form @submit.prevent="handleSubmit">
                    <a-form-item>
                        <a-input v-model:value="username" placeholder="Username" />
                    </a-form-item>
                    <a-form-item>
                        <a-input v-model:value="password" type="password" placeholder="Password" />
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
            username: '',
            password: ''
        };
    },
    created() {
        if (sessionStorage.getItem('adminAuth')) {
            this.$router.push('/admin');
        }
    },
    methods: {
        handleSubmit() {
            let adminAuth = 'Basic ' + btoa(this.username + ':' + this.password);
            fetch('https://linebot.otakux.org/api/users/admin/login', {
                method: 'POST',
                headers: {
                    'Authorization': adminAuth
                }
            }).then(res => {
                console.log(res);
                if (res.ok) {
                    // store token
                    sessionStorage.setItem('adminAuth', adminAuth);
                    this.$router.push('/admin?userid=clerkAdmin');
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