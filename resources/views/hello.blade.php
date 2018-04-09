@extends('layouts.default')
@section('title', 'Laravel With Vue Demo')
@section('content')
    <Hello name="Tony"></Hello>
    <Hello></Hello>
@endsection
@section('script')
    <script src="/js/hello.js"></script>
@endsection