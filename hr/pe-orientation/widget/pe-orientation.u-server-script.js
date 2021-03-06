(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
  var userID = gs.getUserID();

  var grUser = new GlideRecord('sys_user');
  if (grUser.get(userID)) {
    data.created_on = grUser.getDisplayValue('sys_created_on');
  }

  data.table = 'sn_hr_core_profile';
  data.userSysID = gs.getUserID();
  data.showWidget = false;
  data.duration = '';
  data.employmentStartDate = '';

  data.async = false; // synchronous by default
  if (data.async && (!input || input.action != 'loadData')) {return;}

  var util = new sn_hr_sp.esc_ProfileChecker();
  data.profileDetails = util.getProfileDetails();

  var isLifecycleActive = GlidePluginManager().isActive('com.sn_hr_lifecycle_events');
  if (isLifecycleActive) {
    if (data.profileDetails && data.profileDetails.type) {
      if (data.profileDetails.type == 'newHire') {
        var start_date = data.profileDetails.newHire.startDate;
        var todayObject = new GlideDateTime();
        var givenDate = new GlideDateTime();
        givenDate.setDisplayValue(start_date);
        var today = todayObject.getLocalDate();
        var duration = new GlideDuration();
        duration = GlideDateTime.subtract(today, givenDate.getLocalDate());
        data.showWidget = true;
        data.duration = duration.getDayPart();
        data.duration = data.duration.toFixed(0);
        data.date = start_date;
        data.startDateMessage = gs.getMessage('Your start date is {0}', start_date);
        data.buttonText = 'Begin Onboarding';
        data.btnLink = options.first_day_guide_link;
        data.dateMsg = 'You start on';

        data.emojicode = '&#127881;';
        data.message = gs.getMessage(
          'Please make sure to complete these tasks in a timely manner so you can start your new job smoothly.'
        );

        // Get id for onBoarding Case

        var onboardingGr = new GlideRecord('sn_hr_core_case');
        onboardingGr.addQuery('assignment_group', '29eb223b57410300eb7cde2edf94f93e'); // TODO Make this dybamic
        onboardingGr.addQuery('hr_service', '64fa4c53534222003066a5f4a11c0875'); // TODO Make this dybamic

        onboardingGr.addQuery('subject_person', data.userSysID);
        onboardingGr.query();
        if (onboardingGr.next()) {
          data.btnLink = data.btnLink + '&sys_id=' + onboardingGr.sys_id.toString();
        }
      } else if (data.profileDetails.type == 'termination') {
        if (data.profileDetails.termination.terminated) {
          data.showWidget = false;
        } else {
          data.emojicode = '&#128532;';
          data.dateMsg = 'Last day is';
          data.showWidget = true;
          data.date = data.profileDetails.termination.endDate;
          data.message = gs.getMessage('Your last day here with this company approaching soon :(');
          data.buttonText = 'Last Day Guide';
          data.btnLink = options.last_day_guide_link;
        }
      } else if (data.profileDetails.type == 'onLeave') {
        if (data.profileDetails.onLeave.goingOnLeaveSoon) {
          data.showWidget = true;
          data.dateMsg = 'leave starts';
          data.date = data.profileDetails.onLeave.date;
          if (
            data.profileDetails.onLeave.reason == 'Maternity Leave' ||
            data.profileDetails.onLeave.reason == 'Paternity Leave'
          ) {
            data.message = gs.getMessage(
              'Congratulations! You will be going on ' +
                data.profileDetails.onLeave.reason +
                ' leave in ' +
                data.profileDetails.onLeave.daysTo +
                ' days'
            );
            data.buttonText = data.profileDetails.onLeave.reason + ' Guide';
            data.btnLink = options.maternity_guide_link;
          } else {
            data.message = gs.getMessage(
              'You will be going on ' +
                data.profileDetails.onLeave.reason +
                ' in ' +
                data.profileDetails.onLeave.daysTo +
                ' days'
            );
            data.buttonText = data.profileDetails.onLeave.reason + ' Guide';
            data.btnLink = options.maternity_guide_link;
          }
        } else if (!data.profileDetails.onLeave.goingOnLeaveSoon) {
          data.showWidget = true;
          data.dateMsg = 'You start on';
          data.date = data.profileDetails.onLeave.date;
          data.message = gs.getMessage(
            'You are scheduled to come back in ' + data.profileDetails.onLeave.daysTo + ' days'
          );
          data.buttonText = 'Need Extension';
          data.btnLink = options.need_extension_link;
        }
      }
    }
  } else {data.showWidget = false;}
})();
