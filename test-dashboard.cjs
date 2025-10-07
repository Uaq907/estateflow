const http = require('http');

function testDashboard() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/dashboard',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response received');
      if (res.statusCode === 200) {
        console.log('✅ Dashboard page is loading');
        if (data.includes('Welcome back')) {
          console.log('✅ Dashboard content is present');
        } else {
          console.log('❌ Dashboard content is missing');
        }
      } else if (res.statusCode === 302 || res.statusCode === 307) {
        console.log('🔄 Dashboard redirecting to:', res.headers.location);
      } else {
        console.log('❌ Dashboard has issues');
        console.log('First 500 characters:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

testDashboard();
