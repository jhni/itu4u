README.txt
==========
This module allows you to create sections. Each section has an installed theme, theme or style 
attached to it. Each section also contains a path setting similar to the new blocks admin. 
You can then assign themes to a list (regexp'ed) paths. 

For example, if you want another style for your "example" path, all you have to do, is create a section with:
name: Example Section
path: example*
and assign (a customade) theme like "example_theme" to that section.


Template suggestion
===================
This module provide page, node and block template suggestion based on section
id and section name. You are able to create sections based templates. All
characters not in [A-Za-z0-9] will be truncated to a hyphen. The suggested 
template names are:

  block-sections-[section id].tpl.php
  block-sections-[section name].tpl.php
  node-sections-[section id].tpl.php
  node-sections-[section name].tpl.php
  page-sections-[section id].tpl.php
  page-sections-[section name].tpl.php

Examples:
1. Section has the id 5 -> suggested page template is "page-sections-5.tpl.php".
2. Section is named "My blue forum" -> suggested page template is "page-sections-my-blue-forum.tpl.php".


Configure Administration theme *without* node edit forms
========================================================
Go to "Administer > Site building > Sections > "Administration theme" > "Edit"
and select "Show on only the listed pages" and change the "Pages" value to:

  admin
  admin/*


Configure Administration theme *with* node edit forms
=====================================================
Go to "Administer > Site building > Sections > "Administration theme" > "Edit"
and select "Show on only the listed pages" and change the "Pages" value to:

  admin
  admin/*
  node/add
  node/*/edit


Notes
=====
  This module is currently under development and I am still figuring out how to make it perform better.
  Also, the logic inside sections_in_section($section = NULL) is suboptimal. Anyone with good preg_match 
  knowledge is welcome to improve it, so that we can avoid to pull all sections out of the DB every call.
  
Ber Kessels [Drupal Services http://www.webschuur.com]

Feedback
======== 
Will be welcomed, but for support, please create an 'issue' of type 'support request' for the project -sections-.
