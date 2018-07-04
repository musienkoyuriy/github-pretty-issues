var selectors = {
  answerItem: '.js-timeline-item',
  loadMoreSectionID: 'progressive-timeline-item-container',
  answersWrapper: '.js-discussion.js-socket-channel',
  discussionItem: '.discussion-item',
  emoji: '.reaction-summary-item g-emoji'
};

function init() {
  var issueAnswers = Array.from(document.querySelectorAll(selectors.answerItem));
  var isLoadMoreSectionExist = false;
  var elementBeforeLoadMoreSection;
  var loadMoreSectionPrevElemID;

  if (!issueAnswers.length) {
    return;
  }

  var resultAnswers = stuckWithActionsSection(issueAnswers.slice());

  resultAnswers.sort(function(curr, next) {
    var currPositiveReactions = getPositiveReactionsAmount(curr[0]);
    var nextPositiveReactions = getPositiveReactionsAmount(next[0]);

    if (currPositiveReactions < nextPositiveReactions) {
      return 1;
    } else {
      return -1;
    }
  });

  var loadMoreSection = document.getElementById(selectors.loadMoreSectionID);

  if (loadMoreSection) {
    isLoadMoreSectionExist = true;
    elementBeforeLoadMoreSection = loadMoreSection.previousElementSibling;
    loadMoreSectionPrevElemID = elementBeforeLoadMoreSection.getAttribute('data-gid');
  }

  var optionsToBuildNodeTree = {
    isLoadMoreSectionExist: isLoadMoreSectionExist,
    loadMoreSection: loadMoreSection,
    loadMoreSectionPrevElemID: loadMoreSectionPrevElemID
  };

  clearInitialItems();
  createSortedItemNodes(resultAnswers, optionsToBuildNodeTree);
}

function createSortedItemNodes(resultAnswers, options) {
  var answersWrapper = document.querySelector(selectors.answersWrapper);
  var flattenResultAnswers = resultAnswers.reduce(function(acc, val) {
    return acc.concat(val);
  }, []);

  flattenResultAnswers.forEach(function(answerNode) {
    answersWrapper.appendChild(answerNode);
  });

  if (options.isLoadMoreSectionExist) {
    var elementBeforeLoadMoreSection = document.querySelector(
      '[data-gid="' + options.loadMoreSectionPrevElemID + '"]'
    );
    var loadMoreSectionClone = options.loadMoreSection.cloneNode(true);

    options.loadMoreSection.parentNode.removeChild(options.loadMoreSection);
    elementBeforeLoadMoreSection.parentNode.insertBefore(
      loadMoreSectionClone,
      elementBeforeLoadMoreSection.nextSibling
    );
  }
}

function clearInitialItems() {
  var items = document.querySelectorAll(selectors.answerItem);

  while (items[0] && items[0].parentNode) {
    items[0].parentNode.removeChild(items[0]);
  }
}

function stuckWithActionsSection(answers) {
  return answers.reduce(function(acc, curr, i, arr) {
    if (!isItemAnActionSection(curr)) {
      if (isItemAnActionSection(arr[i + 1])) {
        acc.push([curr, arr[i + 1]]);
      } else {
        acc.push([curr]);
      }
    }
   return acc;
  }, []);
}

function isItemAnActionSection(answerNode) {
  return answerNode
    ? answerNode.querySelectorAll(selectors.discussionItem).length > 0
    : false;
}

function getPositiveReactionsAmount(answerNode) {
  var positiveReactions = [
    '+1',
    'tada',
    'smile',
    'heart'
  ];
  var reactionElements = Array.from(
    answerNode.querySelectorAll(selectors.emoji)
  );

  return reactionElements
    .filter(function(reactionElem) {
      var reaction = reactionElem.getAttribute('alias');
      
      return positiveReactions.includes(reaction);
    })
    .reduce(function(accum, curr) {
      var reactAmount = Number(curr.nextSibling.wholeText.trim());
      
      return accum += reactAmount;
    }, 0);
}

init();
