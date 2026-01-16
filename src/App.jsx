import { useState } from 'react';
import './App.css';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // ===== API =====
  // 管理者取得所有產品
  async function getProducts() {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error);
    }
  }

  // 檢查是否登入
  async function checkLogin() {
    // 從cookie取出token
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('task2-token='))
      ?.split('=')[1];

    // 設定axios 預設header
    axios.defaults.headers.common['Authorization'] = token;

    try {
      // 呼叫驗證登入api
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
      // // 驗證成功
      // setIsAuth(true);
      // // 通過驗證才抓資料
      // await getProducts();
    } catch (error) {
      // 驗證失敗
      console.log('尚未登入', error.response?.data.message);
    }
  }

  // ===== handlers =====
  // call 登入API，並傳送帳密過去
  async function handleSubmit(e) {
    // 防止跳轉頁面
    e.preventDefault();

    try {
      console.log(`${API_BASE}/admin/signin`);

      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      // 登入成功後拿到response
      const { token, expired } = res.data;

      // 寫入cookie
      document.cookie = `task2-token=${token}; expires=${new Date(expired)};`;

      // 設定axios header包含token
      axios.defaults.headers.common.Authorization = token;

      // 載入產品
      getProducts();

      // 設定isAuth為true
      setIsAuth(true);
    } catch (error) {
      // 此作業不需要，實務上需要
      setIsAuth(false);
      console.log(error);
    }
  }

  // 處理帳號及密碼的輸入
  function handleInputChange(e) {
    const { name, value } = e.target;
    // // 使用input的 id(username、password)去覆蓋formData對應屬性
    setFormData((preData) => {
      return {
        ...preData,
        [name]: value,
      };
    });
  }

  // 處理登出
  function handleLogout() {
    document.cookie = 'task2-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    delete axios.defaults.headers.common.Authorization;

    setIsAuth(false);
    setProducts([]);
    setTempProduct(null);
  }

  // ===== render =====
  return (
    <>
      {isAuth ? (
        // 登入成功的頁面
        <div className="container">
          <div>
            <button
              className="btn btn-secondary "
              type="button"
              onClick={checkLogin}
            >
              確認是否有登入
            </button>
            <button
              className="btn btn-danger "
              onClick={handleLogout}
              type="button"
            >
              登出
            </button>
          </div>

          <div className="row mt-5">
            {/* 左半頁：產品列表*/}
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 左半頁：產品列表資料 */}
                  {products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 右半頁：單一產品細節*/}
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images"
                          alt="副圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // 未登入=>顯示登入頁面
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form
                id="form"
                className="form-signin"
                onSubmit={handleSubmit}
              >
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2026~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
