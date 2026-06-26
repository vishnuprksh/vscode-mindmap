<?php
    /**
    * @fileOverview: Demo backend endpoint for image uploads. It accepts frontend upload requests and returns the uploaded image URL as an absolute URL.
    *
    * Behavior:
    *     1. The response shape is {errno: <error code, 0 for no error>, msg: <error message>, data: {url: <returned URL>}}.
    *     2. The endpoint supports both uploads from the dialog and direct Ctrl + V uploads, which are common after screenshots.
    *
    *
    * Notes:
    *     1. This file path is configurable. See the configuration section in README.md.
    *     2. Upload handling should be adapted for your actual use case.
    *     3. This file has no security hardening and must not be used in production.
    *
    * @author: zhangbobell
    *
    * @date: 2016.07.06
    *
    */

    // Prefix used to return an absolute URL to the frontend.
    $HTTP_PREFIX = 'http://localhost/kityminder-editor/';


    $errno = 0;
    $msg = 'ok';
    $url = '';


    if ((($_FILES["upload_file"]["type"] == "image/gif")
    || ($_FILES["upload_file"]["type"] == "image/jpeg")
    || ($_FILES["upload_file"]["type"] == "image/jpg")
    || ($_FILES["upload_file"]["type"] == "image/png"))
    && ($_FILES["upload_file"]["size"] < 1 * 1000 * 1000)) {

        if ($_FILES["upload_file"]["error"] > 0) {
            $errno = 414;
            $msg = $_FILES["upload_file"]["error"];
        } else {

            // Handle both `Ctrl + V` uploads and regular uploads.
            if ($_FILES["upload_file"]["name"] === 'blob') {
                $ext_name =  'png';
            } else {
                $ext_name =  array_pop(explode('.', $_FILES["upload_file"]["name"]));
            }

            $sha1_name =  sha1_file($_FILES["upload_file"]["tmp_name"]) . '.' . $ext_name;

            move_uploaded_file($_FILES["upload_file"]["tmp_name"], "upload/" . $sha1_name);
            $url = $HTTP_PREFIX . "server/upload/" . $sha1_name;
        }
    } else {
        $errno = 416;
        $msg = 'File is invalid';
    }


    $result = array(
        'errno' => $errno,
        'msg' => $msg,
        'data' => array(
            'url' => $url
        )
    );

    echo json_encode($result);
