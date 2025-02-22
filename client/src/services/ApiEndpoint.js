import axios from 'axios'



const instance = axios.create({
    baseURL: 'http://localhost:4000' ,
    headers:{
        'Content-Type' : 'application/json'
    },
    withCredentials:true
})

export const get=(url,params)=>instance.get(url,{params})
export const post=(url,data)=>instance.post(url,{data})
export const put=(url,data)=>instance.put(url,{data})
export const delet=(url)=>instance.delete(url)

instance.interceptors.request.use(function (config) {
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

instance.interceptors.response.use(function (response) {
        console.log('intercept response',response)
    return response;
  }, function (error) {
    console.log('intercept response',error)
    return Promise.reject(error);
  });