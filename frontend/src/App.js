import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState('');
  const [theme, setTheme] = useState('light');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('请先选择一个文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setResult('正在识别...');
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(`这是一只${data.class_name}！置信度：${(data.confidence * 100).toFixed(2)}%`);
    } catch (error) {
      console.error('Error:', error);
      setResult('识别失败，请重试');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme === 'light' ? 'bg-gradient-to-br from-blue-200 to-green-200' : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white'}`}>
      <button
        className="absolute top-4 right-4 text-2xl bg-transparent border-none cursor-pointer"
        onClick={toggleTheme}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center animate-pulse">猫狗分类器</h1>
      </header>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
        <label className="block mb-4">
          <span className="sr-only">Choose file</span>
          <input 
            type="file" 
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
            "
          />
        </label>
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg mb-4" />
        )}
        <button 
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          识别图片
        </button>
      </form>
      {result && (
        <div className="mt-8 p-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg animate-fade-in-down">
          <p className="text-xl font-semibold">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;