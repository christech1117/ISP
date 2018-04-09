<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title')</title>
</head>
<body>
    <div id="app">
        @yield('content')
    </div>
    <script src="/js/manifest.js"></script>
    <script src="/js/vendor.js"></script>
    @yield('script')
</body>
</html>