const fs = require('fs');
let code = fs.readFileSync('frontend/app/(auth)/login.tsx', 'utf8');

const oldHandleLogin = `  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
        position: 'bottom',
      });
      return;
    }
    
    try {
      setLoginStatus('logging_in');
      const response = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('token', response.data.data.token);
      
      setLoginStatus('success');
      setTimeout(async () => {
        setLoginStatus('idle');
        dispatch(setCredentials(response.data.data));
      }, 2500);
    } catch (err: any) {
      setLoginStatus('idle');
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err.response?.data?.message || err.message || 'Something went wrong',
        position: 'bottom',
      });
    }
  };`;

const newHandleLogin = `  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all fields',
        position: 'bottom',
      });
      return;
    }
    
    try {
      // Show authenticating state for 3 seconds before hitting the API
      setLoginStatus('logging_in');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('token', response.data.data.token);
      
      setLoginStatus('success');
      setTimeout(async () => {
        setLoginStatus('idle');
        dispatch(setCredentials(response.data.data));
      }, 1000);
    } catch (err: any) {
      setLoginStatus('idle');
      
      let msg = err.response?.data?.message || err.message || 'Something went wrong';
      if (err.response?.status === 401) {
        msg = 'Incorrect password';
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: msg,
        position: 'bottom',
      });
    }
  };`;

code = code.replace(oldHandleLogin, newHandleLogin);
fs.writeFileSync('frontend/app/(auth)/login.tsx', code);
