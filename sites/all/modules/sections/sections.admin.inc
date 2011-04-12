<?php
// $Id: sections.admin.inc,v 1.3.2.19 2009/12/15 23:43:33 hass Exp $

/**
 * @file
 * Administrative page callbacks for the sections module.
 */

function sections_admin_settings_form(&$form_state, $section = NULL) {

  if ($section) {
    $edit = (array)$section;
  }
  else {
    $edit = NULL;
  }

  $form['section_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Section settings')
  );
  $form['section_settings']['name'] = array(
    '#type' => $edit['name'] == 'Administration theme' ? 'hidden' : 'textfield',
    '#title' => t('Name'),
    '#default_value' => $edit['name'],
    '#size' => 40,
    '#maxlength' => 64,
    '#description' => t('Give the name of the section.')
  );
  $form['section_settings']['status'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enabled'),
    '#default_value' => $edit['status'],
    '#description' => t('Enable or disable this section.')
  );
  $form['section_settings']['theme'] = array(
    '#type' => 'select',
    '#title' => t('Select theme'),
    '#default_value' => $edit['theme'],
    '#options' => _sections_theme_select(),
    '#description' => t('Select the theme you want to use for this section. Disabled themes are not used until they are enabled on <a href="@url">themes</a> page.', array('@url' => url('admin/build/themes')))
  );
  $form['section_settings']['weight'] = array(
    '#type' => 'weight',
    '#title' => t('Weight'),
    '#default_value' => $edit['weight'] ? $edit['weight'] : 0
  );

  // Role-based visibility settings.
  $default_role_options = array();
  $result = db_query('SELECT rid FROM {sections_roles} WHERE sid = %d', $edit['sid'] ? $edit['sid'] : 0);
  while ($role = db_fetch_object($result)) {
    $default_role_options[] = $role->rid;
  }
  $roles = user_roles();
  $role_options = array();
  foreach ($roles as $rid => $name) {
    $role_options[$rid] = $name;
  }
  $form['role_vis_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Role specific visibility settings'),
    '#collapsible' => TRUE,
  );
  $form['role_vis_settings']['roles'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Show section for specific roles'),
    '#default_value' => $default_role_options,
    '#options' => $role_options,
    '#description' => t('Show this section only for the selected role(s). If you select no roles, the section will be visible to all users. If a user has any of the roles checked, the section will be visible for this user.'),
  );

  // Page specific visibility configurations.
  $form['page_vis_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Page specific visibility settings'),
    '#collapsible' => TRUE,
  );

  $access = user_access('use PHP for block visibility');
  $visibility = isset($edit['visibility']) ? $edit['visibility'] : 1;

  if ($visibility == 2 && !$access) {
    $form['page_vis_settings'] = array();
    $form['page_vis_settings']['visibility'] = array('#type' => 'value', '#value' => 2);
    $form['page_vis_settings']['pages'] = array('#type' => 'value', '#value' => $edit['path']);
  }
  else {
    $options = array(t('Show on every page except the listed pages.'), t('Show on only the listed pages.'));
    $description = t("Enter one page per line as Drupal paths. The '*' character is a wildcard. Example paths are %blog for the blog page and %blog-wildcard for every personal blog. %front is the front page.", array('%blog' => 'blog', '%blog-wildcard' => 'blog/*', '%front' => '<front>'));

    if ($access) {
      $options[] = t('Show if the following PHP code returns <code>TRUE</code> (PHP-mode, experts only).');
      $description .= ' '. t('If the PHP-mode is chosen, enter PHP code between %php. Note that executing incorrect PHP-code can break your Drupal site.', array('%php' => '<?php ?>'));
    }
    $form['page_vis_settings']['visibility'] = array(
      '#type' => 'radios',
      '#title' => t('Activate section on the specific pages'),
      '#options' => $options,
      '#default_value' => $visibility,
    );
    $form['page_vis_settings']['path'] = array(
      '#type' => 'textarea',
      '#title' => t('Pages'),
      '#default_value' => $edit['path'],
      '#description' => $description,
      '#wysiwyg' => FALSE,
    );
  }

  if (!empty($edit['sid'])) {
    // We are updating a section.
    drupal_set_title(t('Edit section %name', array('%name' => $section->name)));
    $form['sid'] = array(
      '#type' => 'hidden',
      '#value' => $edit['sid']
    );
    $form['save'] = array(
      '#type' => 'submit',
      '#value' => t('Save'),
      '#submit' => array('sections_admin_settings_form_save_function')
    );
  }
  else {
    // We are adding a new section.
    drupal_set_title(t('Add section'));
    $form['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Add section')
    );
  }

  return $form;
}

function sections_admin_settings_form_save_function($form, &$form_state) {
  db_query("UPDATE {sections_data} SET name = '%s', status = %d, visibility = %d, theme = '%s', path = '%s', weight = %d WHERE sid = %d", $form_state['values']['name'], $form_state['values']['status'], $form_state['values']['visibility'], $form_state['values']['theme'], $form_state['values']['path'], $form_state['values']['weight'], $form_state['values']['sid']);
  db_query("DELETE FROM {sections_roles} WHERE sid = %d", $form_state['values']['sid']);
  foreach (array_filter($form_state['values']['roles']) as $rid) {
    db_query("INSERT INTO {sections_roles} (rid, sid) VALUES (%d, %d)", $rid, $form_state['values']['sid']);
  }
  drupal_set_message(t('The sections configuration has been saved.'));
  $form_state['redirect'] = 'admin/build/sections';
}

function sections_admin_settings_form_submit($form, &$form_state) {
  db_query("INSERT INTO {sections_data} (name, status, visibility, path, theme, weight) VALUES ('%s', %d, %d, '%s', '%s', %d)", $form_state['values']['name'], $form_state['values']['status'], $form_state['values']['visibility'], $form_state['values']['path'], $form_state['values']['theme'], $form_state['values']['weight']);
  $sid = db_last_insert_id('sections_data', 'sid');
  foreach (array_filter($form_state['values']['roles']) as $rid) {
    db_query("INSERT INTO {sections_roles} (rid, sid) VALUES (%d, %d)", $rid, $sid);
  }
  drupal_set_message(t('The sections configuration has been saved.'));
  $form_state['redirect'] = 'admin/build/sections';
}

function sections_delete_form(&$form_state, $section) {
  $form['name'] = array('#type' => 'hidden', '#value' => $section->name);
  $form['sid'] = array('#type' => 'hidden', '#value' => $section->sid);

  return confirm_form(
    $form,
    t('Delete section %name', array('%name' => $section->name)),
    'admin/build/sections',
    '<p>'. t('Are you sure you want to delete the section %name?', array('%name' => $section->name)) .'</p>',
    t('Delete'),
    t('Cancel')
  );
}

function sections_delete_form_submit($form, &$form_state) {
  db_query('DELETE FROM {sections_data} WHERE sid = %d', $form_state['values']['sid']);
  drupal_set_message(t('The section %name has been deleted.', array('%name' => $form_state['values']['name'])));
  $form_state['redirect'] = 'admin/build/sections';
  return;
}

/**
 * Build the form for ordering sections.
 */
function sections_admin_display_form(&$form_state) {
  $sections = _sections_load();

  // Create tree for submitted data.
  $form['sections'] = array('#tree' => TRUE);

  foreach ($sections as $section) {
    $form['sections'][$section->sid]['sid'] = array(
      '#type' => 'hidden',
      '#value' => $section->sid,
    );
    $form['sections'][$section->sid]['name'] = array(
      '#value' => filter_xss($section->name),
    );
    $form['sections'][$section->sid]['status'] = array(
      '#type' => 'checkbox',
      '#default_value' => $section->status,
    );
    $form['sections'][$section->sid]['theme'] = array(
      '#value' => ($section->theme) ? $section->theme : t('System default'),
    );
    $form['sections'][$section->sid]['weight'] = array(
      '#type' => 'weight',
      '#default_value' => $section->weight,
    );
    $form['sections'][$section->sid]['edit'] = array(
      '#value' => l(t('Edit'), 'admin/build/sections/edit/'. $section->sid),
    );
    // Remove the delete link to prevent deletion of the Administration theme.
    $form['sections'][$section->sid]['delete'] = array(
      '#value' => l(t('Delete'), 'admin/build/sections/delete/'. $section->sid),
      '#access' => ($section->name == 'Administration theme') ? FALSE : TRUE,
    );
  }
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Theme section order configuration form.
 */
function theme_sections_admin_display_form($form) {
  drupal_add_tabledrag('sections-order', 'order', 'sibling', 'sections-order-weight');

  $header = array(
    array('data' => t('Section')),
    array('data' => t('Enabled')),
    array('data' => t('Theme')),
    array('data' => t('Weight')),
    array('data' => t('Operations'), 'colspan' => '2')
  );

  $rows = array();
  foreach (element_children($form['sections']) as $key => $id) {
    // Don't take form control structures.
    if (is_array($form['sections'][$id]['name'])) {
      $form['sections'][$id]['weight']['#attributes']['class'] = 'sections-order-weight';
      $rows[] = array(
        'data' => array(
          drupal_render($form['sections'][$id]['name']),
          drupal_render($form['sections'][$id]['status']),
          drupal_render($form['sections'][$id]['theme']),
          drupal_render($form['sections'][$id]['weight']),
          drupal_render($form['sections'][$id]['edit']),
          drupal_render($form['sections'][$id]['delete'])
        ),
        'class' => 'draggable',
      );
    }
  }
  if (empty($rows)) {
    $rows[] = array(array('data' => t('No sections available.'), 'colspan' => '6'));
  }

  $output = theme('table', $header, $rows, array('id' => 'sections-order'));
  $output .= drupal_render($form);
  return $output;
}

/**
 * Process sections order configuration form submission.
 */
function sections_admin_display_form_submit($form, &$form_state) {
  foreach ($form_state['values']['sections'] as $section) {
    db_query("UPDATE {sections_data} SET status = %d, weight = %d WHERE sid = %d", $section['status'], $section['weight'], $section['sid']);
  }
  drupal_set_message(t('The sections configuration has been saved.'));
}

/**
 * Load all sections.
 */
function _sections_load() {
  $res = db_query("SELECT * FROM {sections_data} ORDER BY weight");
  $sections = array();
  while ($row = db_fetch_object($res)) {
    $sections[] = $row;
  }
  return $sections;
}
