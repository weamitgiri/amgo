<div class="modal fade" id="modal-lg">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title boxName">View</h4>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">

        <div class="wrapper imageBox">
          <div class="box box1">
            <img class="imgUrl" width="100%" src="" alt="image">
          </div>
        </div>

        <div class="wrapper videoBox">
          <div class="box box1">
            <video autoplay loop class="vdoUrl" width="100%" src="" controls>
          </div>
        </div>

        <div class="wrapper pdfBox">
          <div class="box box1">
             <iframe class="pdfUrl" width="100%" height="450px" src=""></iframe>
          </div>
        </div>

        <div class="wrapper iframeBox">
          <div class="box box1">
             <iframe class="iframeUrl" width="100%" height="450px" src=""></iframe>
          </div>
        </div>

        <div class="wrapper textBox">
          <div class="box box1">
            <h6 class="textVal"></h6>
          </div>
        </div>

      </div>
      <div class="modal-footer justify-content-between">
        <button type="button" class="btn btn-outline-danger" data-dismiss="modal">Close</button>
        <!-- <button type="button" class="btn btn-primary">Save changes</button> -->
      </div>
    </div>
    <!-- /.modal-content -->
  </div>
  <!-- /.modal-dialog -->
</div>
<!-- /.modal -->

<footer class="main-footer main-footer-2">
    <strong class="text-center">Copyright &copy; {{date('Y')}} .</strong>
    All rights reserved.
    <div class="float-right d-none d-sm-inline-block">
      <b></b>
    </div>

    <!-- <script src="https://cdn.ckeditor.com/4.20.0/standard/ckeditor.js" nonce="{{ csrf_token() }}"></script> -->

<!-- <script src="{{ asset('admin/dist/js/kc/jquery.js')}}"></script>

<script src="{{ asset('admin/dist/js/kc/config.js')}}"></script>
<script src="{{ asset('admin/dist/js/kc/editor.js')}}"></script>
<script src="{{ asset('admin/dist/js/kc/ckeditor.js')}}"></script> -->
  </footer>
  
  <!-- <aside class="control-sidebar control-sidebar-dark"></aside> -->
  
</div>