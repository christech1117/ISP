<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title')</title>
</head>
<body>
    <div id="app">
        <nav-bar></nav-bar>
        <side-bar></side-bar>
        @yield('content')
    </div>
    <script src="/js/manifest.js"></script>
    <script src="/js/vendor.js"></script>
    <script src="/js/fontawesome-all.js"></script>
    <script src="/js/app.js"></script>
    @yield('script')
</body>
</html>