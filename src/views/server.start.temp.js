const appTheme = `
<!DOCTYPE html>
<html>
<head>
  <title>Welcome</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      font-family: Arial, sans-serif;
    }

    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 40px 60px;
      border-radius: 20px;
      text-align: center;
      color: white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    }

    h1 {
      margin: 0;
      font-size: 32px;
      letter-spacing: 1px;
    }

    p {
      margin-top: 10px;
      opacity: 0.8;
    }

    .btn {
      margin-top: 20px;
      padding: 10px 20px;
      border: none;
      border-radius: 25px;
      background: white;
      color: #764ba2;
      cursor: pointer;
      font-weight: bold;
      transition: 0.3s;
    }

    .btn:hover {
      background: #f0f0f0;
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Welcome to Internshala</h1>
    <p>Your backend is running successfully</p>
    <button class="btn">Let's Go</button>
  </div>
</body>
</html>
`;

module.exports = appTheme;