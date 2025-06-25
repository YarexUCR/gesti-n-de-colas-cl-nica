function protegerPagina(rolRequerido) {
    const usuario = localStorage.getItem('usuario');
    const rol = localStorage.getItem('rol');
  
    if (!usuario || !rol) {
      alert('Debe iniciar sesión.');
      window.location.href = '/login.html';
      return;
    }
  
    if (rol !== rolRequerido) {
      alert('Acceso denegado. Rol no autorizado.');
      window.location.href = '/login.html';
    }
  }
  