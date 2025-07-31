import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

function ProjectLightspeed() {
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  // const [calendarView, setCalendarView] = useState('month'); // Unused for now
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [showTodoPopup, setShowTodoPopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedType, setDraggedType] = useState(null);
  const fileInputRef = useRef(null);
  const noteInputRef = useRef(null);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabs, setTabs] = useState([
    { 
      id: 'general', 
      name: 'General', 
      isOpen: true, 
      color: 'blue',
      icon: '📁',
      parentId: null,
      unreadCount: 0,
      details: {
        pointOfContact: '',
        email: '',
        phone: '',
        description: '',
        customFields: []
      }
    },
    { 
      id: 'work', 
      name: 'Acme Corp', 
      isOpen: true, 
      color: 'green',
      icon: '🏢',
      parentId: null,
      unreadCount: 0,
      details: {
        pointOfContact: 'John Doe',
        email: 'john@acme.com',
        phone: '+1 234 567 8900',
        description: 'Main work project',
        customFields: []
      }
    }
  ]);
  // const [selectedTab, setSelectedTab] = useState(null); // Unused for now
  const [showTabDetails, setShowTabDetails] = useState(false);
  const [showAddTab, setShowAddTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabColor, setNewTabColor] = useState('blue');
  const [newTabIcon, setNewTabIcon] = useState('📁');
  const [newTabParentId, setNewTabParentId] = useState(null);
  const [showTabStats, setShowTabStats] = useState(null);
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '', icon: '📌' });
  const [newSubtask, setNewSubtask] = useState('');
  const [editingTab, setEditingTab] = useState(null);
  
  // New states
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [tabSearchTerm, setTabSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({ notes: [], todos: [] });
  // const [showBulkActions, setShowBulkActions] = useState(false); // Unused for now
  const [bulkMoveTarget, setBulkMoveTarget] = useState('');
  const [activeTabId, setActiveTabId] = useState('general');
  const [showRecent, setShowRecent] = useState(false);
  const [noteTemplate, setNoteTemplate] = useState('');
  const [draggedTab, setDraggedTab] = useState(null);
  const [dragOverTab, setDragOverTab] = useState(null);
  const [dragPosition, setDragPosition] = useState(''); // 'before', 'after', or 'inside'
  const [deletedItems, setDeletedItems] = useState({ notes: [], todos: [] });
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const iconOptions = ['📁', '📂', '🏢', '🏠', '💼', '📊', '📈', '💡', '🎯', '🚀', '⭐', '🔧', '💎', '🎨', '📱', '💻', '🌟', '🔥', '❤️', '📌'];

  const noteTemplates = {
    meeting: "Meeting Notes\n\nDate: \nAttendees: \n\nAgenda:\n- \n\nAction Items:\n- \n\nNext Steps:",
    standup: "Daily Standup\n\nYesterday:\n- \n\nToday:\n- \n\nBlockers:\n- ",
    bug: "Bug Report\n\nTitle: \nSeverity: \nSteps to Reproduce:\n1. \n\nExpected Result:\n\nActual Result:\n",
    idea: "Idea/Proposal\n\nConcept:\n\nBenefits:\n- \n\nImplementation:\n- \n\nResources Needed:"
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-save indicator
  const showSaved = useCallback(() => {
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  }, []);

  // Keyboard shortcuts - removed for debugging
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowAddTab(false);
        setShowTabDetails(false);
        setShowCalendar(false);
        setShowTabStats(null);
        setShowNotePopup(false);
        setShowTodoPopup(false);
        // setShowBulkActions(false); // Unused for now
        setShowRecent(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTab = (tabId) => {
    const element = document.getElementById(`tab-${tabId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const applyFormatting = (type) => {
    // For now, just add markdown symbols
    const textarea = noteInputRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = newNote.substring(start, end);
    const beforeText = newNote.substring(0, start);
    const afterText = newNote.substring(end);
    
    let formattedText = '';
    
    switch(type) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '**bold text**';
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '*italic text*';
        break;
      case 'bullet':
        formattedText = selectedText ? `• ${selectedText}` : '• ';
        break;
      default:
        formattedText = selectedText;
        break;
    }
    
    const newText = beforeText + formattedText + afterText;
    setNewNote(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        content: newNote,
        timestamp: new Date().toISOString(),
        tabId: null,
        isInTopBar: true,
        isNew: true
      };
      setNotes([...notes, note]);
      
      setNewNote('');
      showSaved();
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        priority: 'medium',
        dueDate: '',
        timestamp: new Date().toISOString(),
        tabId: null,
        isInTopBar: true,
        subtasks: [],
        isNew: true
      };
      setTodos([...todos, todo]);
      
      setNewTodo('');
      showSaved();
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    showSaved();
  };

  const deleteNote = (id) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (noteToDelete) {
      // Move to recycle bin
      setDeletedItems({
        ...deletedItems,
        notes: [...deletedItems.notes, { ...noteToDelete, deletedAt: new Date().toISOString() }]
      });
      setNotes(notes.filter(n => n.id !== id));
      setSelectedItems({ ...selectedItems, notes: selectedItems.notes.filter(nId => nId !== id) });
      showSaved();
    }
  };

  const deleteTodo = (id) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (todoToDelete) {
      // Move to recycle bin
      setDeletedItems({
        ...deletedItems,
        todos: [...deletedItems.todos, { ...todoToDelete, deletedAt: new Date().toISOString() }]
      });
      setTodos(todos.filter(t => t.id !== id));
      setSelectedItems({ ...selectedItems, todos: selectedItems.todos.filter(tId => tId !== id) });
      showSaved();
    }
  };

  const confirmDelete = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'note') {
        deleteNote(itemToDelete.item.id);
      } else {
        deleteTodo(itemToDelete.item.id);
      }
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const restoreItem = (item, type) => {
    if (type === 'note') {
      const { deletedAt, ...noteWithoutDeletedAt } = item;
      setNotes([...notes, noteWithoutDeletedAt]);
      setDeletedItems({
        ...deletedItems,
        notes: deletedItems.notes.filter(n => n.id !== item.id)
      });
    } else {
      const { deletedAt, ...todoWithoutDeletedAt } = item;
      setTodos([...todos, todoWithoutDeletedAt]);
      setDeletedItems({
        ...deletedItems,
        todos: deletedItems.todos.filter(t => t.id !== item.id)
      });
    }
    showSaved();
  };

  const permanentlyDelete = (item, type) => {
    if (type === 'note') {
      setDeletedItems({
        ...deletedItems,
        notes: deletedItems.notes.filter(n => n.id !== item.id)
      });
    } else {
      setDeletedItems({
        ...deletedItems,
        todos: deletedItems.todos.filter(t => t.id !== item.id)
      });
    }
    showSaved();
  };

  const emptyRecycleBin = () => {
    if (window.confirm('Are you sure you want to permanently delete all items in the recycle bin? This cannot be undone.')) {
      setDeletedItems({ notes: [], todos: [] });
      showSaved();
    }
  };

  const openNotePopup = (note) => {
    setSelectedNote(note);
    setShowNotePopup(true);
  };

  const openTodoPopup = (todo) => {
    setSelectedTodo(todo);
    setShowTodoPopup(true);
  };

  const updateNote = (noteId, updates) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, ...updates, isNew: false } : note
    ));
    showSaved();
  };

  const updateTodo = (todoId, updates) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, ...updates, isNew: false } : todo
    ));
    showSaved();
  };

  const addSubtask = (todoId) => {
    if (newSubtask.trim()) {
      const subtask = {
        id: Date.now(),
        text: newSubtask,
        completed: false
      };
      const updatedTodos = todos.map(todo => 
        todo.id === todoId ? { 
          ...todo, 
          subtasks: [...(todo.subtasks || []), subtask] 
        } : todo
      );
      setTodos(updatedTodos);
      
      if (selectedTodo && selectedTodo.id === todoId) {
        setSelectedTodo({
          ...selectedTodo,
          subtasks: [...(selectedTodo.subtasks || []), subtask]
        });
      }
      
      setNewSubtask('');
      showSaved();
    }
  };

  const toggleSubtask = (todoId, subtaskId) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId ? {
        ...todo,
        subtasks: todo.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        )
      } : todo
    );
    setTodos(updatedTodos);
    
    if (selectedTodo && selectedTodo.id === todoId) {
      setSelectedTodo({
        ...selectedTodo,
        subtasks: selectedTodo.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        )
      });
    }
    showSaved();
  };

  const deleteSubtask = (todoId, subtaskId) => {
    const updatedTodos = todos.map(todo => 
      todo.id === todoId ? {
        ...todo,
        subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId)
      } : todo
    );
    setTodos(updatedTodos);
    
    if (selectedTodo && selectedTodo.id === todoId) {
      setSelectedTodo({
        ...selectedTodo,
        subtasks: selectedTodo.subtasks.filter(subtask => subtask.id !== subtaskId)
      });
    }
    showSaved();
  };

  // Memoized filtered results
  const filteredNotes = useMemo(() => 
    notes.filter(note => 
      note.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [notes, debouncedSearchTerm]
  );

  const filteredTodos = useMemo(() => 
    todos.filter(todo => 
      todo.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [todos, debouncedSearchTerm]
  );

  // Recent items
  const recentItems = useMemo(() => {
    const allItems = [
      ...notes.map(n => ({ ...n, type: 'note', timestamp: new Date(n.timestamp) })),
      ...todos.map(t => ({ ...t, type: 'todo', timestamp: new Date(t.timestamp) }))
    ];
    return allItems
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [notes, todos]);

  const getTabItems = (tabId) => {
    const tabNotes = filteredNotes.filter(note => note.tabId === tabId);
    const tabTodos = filteredTodos.filter(todo => todo.tabId === tabId);
    const completedTodos = tabTodos.filter(todo => todo.completed).length;
    const activeTodos = tabTodos.filter(todo => !todo.completed).length;
    return { notes: tabNotes, todos: tabTodos, completedTodos, activeTodos };
  };

  // const updateTab = (tabId, updates) => {
  //   setTabs(tabs.map(tab => 
  //     tab.id === tabId ? { ...tab, ...updates } : tab
  //   ));
  //   showSaved();
  // };

  const openTabDetails = (tab) => {
    setEditingTab({ ...tab });
    setShowTabDetails(true);
  };

  const saveTabDetails = () => {
    if (editingTab) {
      setTabs(tabs.map(tab => 
        tab.id === editingTab.id ? editingTab : tab
      ));
      showSaved();
    }
  };

  const markTabAsRead = (tabId) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, unreadCount: 0 } : tab
    ));
  };

  const toggleTab = (tabId) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, isOpen: !tab.isOpen } : tab
    ));
    if (tabs.find(t => t.id === tabId)?.isOpen) {
      markTabAsRead(tabId);
    }
  };

  const collapseAllTabs = () => {
    setTabs(tabs.map(tab => ({ ...tab, isOpen: false })));
  };

  const expandAllTabs = () => {
    setTabs(tabs.map(tab => ({ ...tab, isOpen: true, unreadCount: 0 })));
  };

  const addNewTab = () => {
    if (newTabName.trim()) {
      const newTab = {
        id: Date.now().toString(),
        name: newTabName,
        isOpen: true,
        color: newTabColor,
        icon: newTabIcon,
        parentId: newTabParentId,
        unreadCount: 0,
        details: {
          pointOfContact: '',
          email: '',
          phone: '',
          description: '',
          customFields: []
        }
      };
      setTabs([...tabs, newTab]);
      setNewTabName('');
      setNewTabColor('blue');
      setNewTabIcon('📁');
      setNewTabParentId(null);
      setShowAddTab(false);
      showSaved();
    }
  };

  const deleteTab = (tabId) => {
    const tabsToDelete = [tabId];
    const findChildTabs = (parentId) => {
      tabs.filter(tab => tab.parentId === parentId).forEach(childTab => {
        tabsToDelete.push(childTab.id);
        findChildTabs(childTab.id);
      });
    };
    findChildTabs(tabId);
    
    if (tabs.filter(tab => !tabsToDelete.includes(tab.id)).length === 0) {
      alert('Cannot delete the last tab!');
      return;
    }
    
    setNotes(notes.map(note => 
      tabsToDelete.includes(note.tabId) ? { ...note, tabId: 'general' } : note
    ));
    setTodos(todos.map(todo => 
      tabsToDelete.includes(todo.tabId) ? { ...todo, tabId: 'general' } : todo
    ));
    setTabs(tabs.filter(tab => !tabsToDelete.includes(tab.id)));
    setShowTabDetails(false);
    showSaved();
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-100 border-blue-300',
      green: darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-100 border-green-300',
      purple: darkMode ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-100 border-purple-300',
      red: darkMode ? 'bg-red-900/30 border-red-600' : 'bg-red-100 border-red-300',
      yellow: darkMode ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-100 border-yellow-300'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      high: 'border-l-4 border-l-red-500',
      medium: 'border-l-4 border-l-yellow-500',
      low: 'border-l-4 border-l-green-500'
    };
    return priorityMap[priority] || priorityMap.medium;
  };

  const getTabColor = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.color || 'blue';
  };

  const exportData = () => {
    const data = { 
      notes, 
      todos, 
      tabs,
      deletedItems,
      exportDate: new Date().toISOString(),
      version: '2.3'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lightspeed-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.notes) setNotes(data.notes);
          if (data.todos) setTodos(data.todos);
          if (data.tabs) setTabs(data.tabs);
          if (data.deletedItems) setDeletedItems(data.deletedItems);
          alert('Data imported successfully!');
          showSaved();
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Bulk actions
  const toggleItemSelection = (itemId, type) => {
    if (type === 'note') {
      setSelectedItems({
        ...selectedItems,
        notes: selectedItems.notes.includes(itemId)
          ? selectedItems.notes.filter(id => id !== itemId)
          : [...selectedItems.notes, itemId]
      });
    } else {
      setSelectedItems({
        ...selectedItems,
        todos: selectedItems.todos.includes(itemId)
          ? selectedItems.todos.filter(id => id !== itemId)
          : [...selectedItems.todos, itemId]
      });
    }
  };

  const bulkMoveItems = () => {
    if (bulkMoveTarget) {
      setNotes(notes.map(note => 
        selectedItems.notes.includes(note.id) 
          ? { ...note, tabId: bulkMoveTarget, isInTopBar: false } 
          : note
      ));
      setTodos(todos.map(todo => 
        selectedItems.todos.includes(todo.id) 
          ? { ...todo, tabId: bulkMoveTarget, isInTopBar: false } 
          : todo
      ));
      setSelectedItems({ notes: [], todos: [] });
      setBulkMoveTarget('');
      showSaved();
    }
  };

  const clearSelections = () => {
    setSelectedItems({ notes: [], todos: [] });
  };

  // Tab drag and drop handlers
  const handleTabDragStart = (e, tab) => {
    setDraggedTab(tab);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleTabDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTab(null);
    setDragOverTab(null);
    setDragPosition('');
  };

  const handleTabDragOver = (e, tab) => {
    e.preventDefault();
    if (!draggedTab || draggedTab.id === tab.id) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Determine position based on cursor location
    if (y < height * 0.25) {
      setDragPosition('before');
    } else if (y > height * 0.75) {
      setDragPosition('after');
    } else {
      setDragPosition('inside');
    }
    
    setDragOverTab(tab);
  };

  const handleTabDrop = (e, targetTab) => {
    e.preventDefault();
    if (!draggedTab || draggedTab.id === targetTab.id) return;
    
    // Check if moving a parent into its own child (prevent circular reference)
    const isMovingParentIntoChild = (parentId, childId) => {
      let currentTab = tabs.find(t => t.id === childId);
      while (currentTab?.parentId) {
        if (currentTab.parentId === parentId) return true;
        currentTab = tabs.find(t => t.id === currentTab.parentId);
      }
      return false;
    };
    
    if (isMovingParentIntoChild(draggedTab.id, targetTab.id)) {
      alert("Cannot move a tab into its own subtab!");
      return;
    }
    
    let updatedTabs = [...tabs];
    
    if (dragPosition === 'inside') {
      // Make dragged tab a child of target tab
      updatedTabs = updatedTabs.map(tab => 
        tab.id === draggedTab.id ? { ...tab, parentId: targetTab.id } : tab
      );
    } else {
      // Reorder tabs at the same level
      const targetParentId = targetTab.parentId;
      const draggedIndex = updatedTabs.findIndex(t => t.id === draggedTab.id);
      const targetIndex = updatedTabs.findIndex(t => t.id === targetTab.id);
      
      // First update the dragged tab's parent
      updatedTabs[draggedIndex] = { ...updatedTabs[draggedIndex], parentId: targetParentId };
      
      // Remove dragged tab from array
      const [removed] = updatedTabs.splice(draggedIndex, 1);
      
      // Find new index after removal
      const newTargetIndex = updatedTabs.findIndex(t => t.id === targetTab.id);
      
      // Insert at correct position
      if (dragPosition === 'before') {
        updatedTabs.splice(newTargetIndex, 0, removed);
      } else {
        updatedTabs.splice(newTargetIndex + 1, 0, removed);
      }
    }
    
    setTabs(updatedTabs);
    setDraggedTab(null);
    setDragOverTab(null);
    setDragPosition('');
    showSaved();
  };

  const handleTabDragLeave = () => {
    setDragOverTab(null);
    setDragPosition('');
  };

  // Item drag and drop handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem(item);
    setDraggedType(type);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDraggedType(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnTab = (tabId) => {
    if (!draggedItem || !draggedType) return;
    
    if (draggedType === 'note') {
      setNotes(notes.map(note => 
        note.id === draggedItem.id ? { ...note, tabId, isInTopBar: false } : note
      ));
    } else if (draggedType === 'todo') {
      setTodos(todos.map(todo => 
        todo.id === draggedItem.id ? { ...todo, tabId, isInTopBar: false } : todo
      ));
    }
    showSaved();
  };

  const handleDropOnQuickAccess = (e) => {
    e.preventDefault();
    if (!draggedItem || !draggedType) return;
    
    if (draggedType === 'note') {
      setNotes(notes.map(note => 
        note.id === draggedItem.id ? { ...note, tabId: null, isInTopBar: true } : note
      ));
    } else if (draggedType === 'todo') {
      setTodos(todos.map(todo => 
        todo.id === draggedItem.id ? { ...todo, tabId: null, isInTopBar: true } : todo
      ));
    }
    showSaved();
  };

  const moveItemToTab = (itemId, itemType, targetTabId) => {
    if (itemType === 'note') {
      setNotes(notes.map(note => 
        note.id === itemId ? { ...note, tabId: targetTabId, isInTopBar: false } : note
      ));
    } else if (itemType === 'todo') {
      setTodos(todos.map(todo => 
        todo.id === itemId ? { ...todo, tabId: targetTabId, isInTopBar: false } : todo
      ));
    }
    showSaved();
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getTodosForDate = (date) => {
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const [year, month, day] = todo.dueDate.split('-');
      const todoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return todoDate.getFullYear() === date.getFullYear() &&
             todoDate.getMonth() === date.getMonth() &&
             todoDate.getDate() === date.getDate();
    });
  };

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const addCustomField = () => {
    if (newCustomField.key && newCustomField.value && editingTab) {
      const updatedTab = {
        ...editingTab,
        details: {
          ...editingTab.details,
          customFields: [...(editingTab.details.customFields || []), { ...newCustomField, id: Date.now() }]
        }
      };
      setEditingTab(updatedTab);
      setNewCustomField({ key: '', value: '', icon: '📌' });
    }
  };

  const removeCustomField = (fieldId) => {
    if (editingTab) {
      const updatedTab = {
        ...editingTab,
        details: {
          ...editingTab.details,
          customFields: editingTab.details.customFields.filter(field => field.id !== fieldId)
        }
      };
      setEditingTab(updatedTab);
    }
  };

  const getChildTabs = (parentId) => {
    return tabs.filter(tab => tab.parentId === parentId);
  };

  const getFilteredTabs = () => {
    if (!tabSearchTerm) return tabs;
    return tabs.filter(tab => 
      tab.name.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
      tab.icon.includes(tabSearchTerm)
    );
  };

  const renderTabs = (parentId = null, level = 0) => {
    const filteredTabs = getFilteredTabs();
    const tabsAtLevel = filteredTabs.filter(tab => tab.parentId === parentId);
    
    return tabsAtLevel.map(tab => {
      const shouldRenderContent = tab.isOpen;
      
      return (
        <div key={tab.id} id={`tab-${tab.id}`} className="mb-2">
          <div 
            className={`group flex items-center justify-between px-3 py-2 ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100/30'} transition-all ${getColorClasses(tab.color)} border-l-4 rounded-r-lg relative overflow-hidden ${activeTabId === tab.id ? 'ring-2 ring-blue-500' : ''} cursor-move
              ${dragOverTab?.id === tab.id && dragPosition === 'before' ? 'border-t-2 border-t-blue-500' : ''}
              ${dragOverTab?.id === tab.id && dragPosition === 'after' ? 'border-b-2 border-b-blue-500' : ''}
              ${dragOverTab?.id === tab.id && dragPosition === 'inside' ? 'ring-2 ring-green-500' : ''}
            `}
            style={{ marginLeft: `${level * 12}px` }}
            draggable
            onDragStart={(e) => handleTabDragStart(e, tab)}
            onDragEnd={handleTabDragEnd}
            onDragOver={(e) => handleTabDragOver(e, tab)}
            onDragLeave={handleTabDragLeave}
            onDrop={(e) => {
              handleTabDrop(e, tab);
              handleDropOnTab(tab.id);
            }}
            onClick={() => setActiveTabId(tab.id)}
            title={sidebarCollapsed ? tab.name : `${tab.name} - Drag to reorder or nest`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {!sidebarCollapsed && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTab(tab.id);
                  }}
                  className={`${darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-white/50'} p-1 rounded flex-shrink-0`}
                >
                  {getChildTabs(tab.id).length > 0 ? (tab.isOpen ? '▼' : '▶') : '◦'}
                </button>
              )}
              <span className="text-lg flex-shrink-0">{tab.icon}</span>
              {!sidebarCollapsed && (
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                  {tab.name}
                </span>
              )}
              {tab.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                  {tab.unreadCount}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewTabParentId(tab.id);
                    setShowAddTab(true);
                  }}
                  className={`p-1 ${darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-white/50'} rounded`}
                  title="Add subtab"
                >
                  <span className="text-xs">+</span>
                </button>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  {getTabItems(tab.id).notes.length + getTabItems(tab.id).todos.length}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openTabDetails(tab);
                  }}
                  className={`p-1 ${darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-white/50'} rounded`}
                >
                  <span className="text-xs">⚙</span>
                </button>
              </div>
            )}
          </div>
          
          {showTabStats === tab.id && (
            <div className={`ml-6 px-4 py-3 ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100/50'} rounded-lg mt-2`}>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Notes:</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{getTabItems(tab.id).notes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Active Todos:</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{getTabItems(tab.id).activeTodos}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Completed Todos:</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{getTabItems(tab.id).completedTodos}</span>
                </div>
              </div>
            </div>
          )}
          
          {shouldRenderContent && tab.isOpen && (
            <div className="pl-8 pr-4 pt-2 space-y-2" style={{ marginLeft: `${level * 20}px` }}>
              {getTabItems(tab.id).notes.map(note => (
                <div 
                  key={note.id} 
                  className={`group p-2 ${darkMode ? 'bg-yellow-900/30 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'} border rounded-lg cursor-move relative ${selectedItems.notes.includes(note.id) ? 'ring-2 ring-blue-500' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note, 'note')}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${
                    getTabColor(note.tabId) === 'blue' ? 'bg-blue-500' :
                    getTabColor(note.tabId) === 'green' ? 'bg-green-500' :
                    getTabColor(note.tabId) === 'purple' ? 'bg-purple-500' :
                    getTabColor(note.tabId) === 'red' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.notes.includes(note.id)}
                      onChange={() => toggleItemSelection(note.id, 'note')}
                      className={`mt-1 flex-shrink-0 transition-opacity ${
                        selectedItems.notes.includes(note.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p 
                        className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} cursor-pointer hover:text-blue-500 line-clamp-2 break-words`}
                        onClick={() => openNotePopup(note)}
                      >
                        {note.content}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(note.timestamp).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={note.tabId || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                moveItemToTab(note.id, 'note', e.target.value);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded px-2 py-1`}
                          >
                            <option value="">Move to...</option>
                            {tabs.map(tabOption => (
                              <option key={tabOption.id} value={tabOption.id} disabled={tabOption.id === note.tabId}>
                                {tabOption.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(note, 'note');
                            }}
                            className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {getTabItems(tab.id).todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`group p-2 ${darkMode ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'} border rounded-lg ${todo.completed ? 'opacity-60' : ''} cursor-move relative ${selectedItems.todos.includes(todo.id) ? 'ring-2 ring-blue-500' : ''} ${getPriorityColor(todo.priority)}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo, 'todo')}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${
                    getTabColor(todo.tabId) === 'blue' ? 'bg-blue-500' :
                    getTabColor(todo.tabId) === 'green' ? 'bg-green-500' :
                    getTabColor(todo.tabId) === 'purple' ? 'bg-purple-500' :
                    getTabColor(todo.tabId) === 'red' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.todos.includes(todo.id)}
                      onChange={() => toggleItemSelection(todo.id, 'todo')}
                      className={`mt-1 flex-shrink-0 transition-opacity ${
                        selectedItems.todos.includes(todo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <span 
                        className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} ${todo.completed ? 'line-through' : ''} cursor-pointer hover:text-blue-500 line-clamp-2 break-words block`}
                        onClick={() => openTodoPopup(todo)}
                      >
                        {todo.text}
                      </span>
                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} subtasks
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todo.priority} priority
                          {todo.dueDate && ` • Due: ${todo.dueDate}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            className="w-4 h-4"
                            title="Mark as complete"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(todo, 'todo');
                            }}
                            className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {renderTabs(tab.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const topNotes = filteredNotes.filter(note => note.isInTopBar);
  const topTodos = filteredTodos.filter(todo => todo.isInTopBar);

  const themeClasses = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white'
    : 'bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-800';

  return (
    <div className={`min-h-screen ${themeClasses} transition-all duration-500`}>
      {showSaveIndicator && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse z-50">
          ✓ Saved
        </div>
      )}

      <div className={`h-16 ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700/30' : 'border-gray-200/30'} px-6 flex items-center justify-between shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Project Lightspeed</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search notes and todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-80 ${darkMode ? 'bg-gray-700/80 border-gray-600 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          
          <button
            onClick={() => setShowRecent(!showRecent)}
            className={`p-2 ${showRecent ? 'bg-purple-500 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Recent Items"
          >
            🕐
          </button>
          
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-2 ${showCalendar ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Calendar View"
          >
            📅
          </button>
          
          <button
            onClick={() => setShowShortcuts(true)}
            className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Keyboard Shortcuts"
          >
            ⌨️
          </button>
          
          <button
            onClick={() => setShowRecycleBin(!showRecycleBin)}
            className={`p-2 ${showRecycleBin ? 'bg-red-500 text-white' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all relative`}
            title="Recycle Bin"
          >
            🗑️
            {(deletedItems.notes.length + deletedItems.todos.length) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {deletedItems.notes.length + deletedItems.todos.length}
              </span>
            )}
          </button>
          
          <div className="h-6 w-px bg-gray-400/30 mx-1" />
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Toggle Dark Mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <button
            onClick={exportData}
            className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Export Data"
          >
            💾
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={importData}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
            title="Import Data"
          >
            📂
          </button>
        </div>
      </div>

      {showRecent && (
        <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'} p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Items</h3>
          <div className="space-y-2">
            {recentItems.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-3 rounded-lg cursor-pointer ${
                  item.type === 'note' 
                    ? darkMode ? 'bg-yellow-900/30 hover:bg-yellow-900/50' : 'bg-yellow-50 hover:bg-yellow-100'
                    : darkMode ? 'bg-green-900/30 hover:bg-green-900/50' : 'bg-green-50 hover:bg-green-100'
                }`}
                onClick={() => item.type === 'note' ? openNotePopup(item) : openTodoPopup(item)}
              >
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {item.type === 'note' ? '📝' : '✓'} {item.type === 'note' ? item.content : item.text}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCalendar && (
        <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateCalendar(-1)}
                className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                ←
              </button>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {formatMonth(currentDate)}
              </h3>
              <button
                onClick={() => navigateCalendar(1)}
                className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg`}
              >
                →
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} py-2`}>
                {day}
              </div>
            ))}
            {getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={`min-h-[80px] p-2 ${date ? darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:bg-gray-50' : ''} rounded-lg`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getTodosForDate(date).slice(0, 3).map(todo => (
                        <div
                          key={todo.id}
                          className={`text-xs p-1 rounded ${todo.completed ? 'opacity-50 line-through' : ''} ${
                            darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {todo.text.substring(0, 20)}...
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedItems.notes.length > 0 || selectedItems.todos.length > 0) && (
        <div className={`${darkMode ? 'bg-blue-900/80' : 'bg-blue-100/80'} backdrop-blur-sm border-b ${darkMode ? 'border-blue-700/30' : 'border-blue-300/30'} px-6 py-3 flex items-center justify-between`}>
          <span className={`${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            {selectedItems.notes.length + selectedItems.todos.length} items selected
          </span>
          <div className="flex items-center gap-3">
            <select
              value={bulkMoveTarget}
              onChange={(e) => setBulkMoveTarget(e.target.value)}
              className={`px-3 py-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
            >
              <option value="">Move to...</option>
              {tabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.icon} {tab.name}</option>
              ))}
            </select>
            <button
              onClick={bulkMoveItems}
              disabled={!bulkMoveTarget}
              className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move Items
            </button>
            <button
              onClick={clearSelections}
              className={`px-4 py-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Delete {itemToDelete.type === 'note' ? 'Note' : 'Todo'}?
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this {itemToDelete.type}? It will be moved to the recycle bin.
            </p>
            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg mb-6`}>
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-2`}>
                {itemToDelete.type === 'note' ? itemToDelete.item.content : itemToDelete.item.text}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRecycleBin(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                🗑️ Recycle Bin ({deletedItems.notes.length + deletedItems.todos.length} items)
              </h3>
              <button
                onClick={() => setShowRecycleBin(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ✕
              </button>
            </div>
            
            {deletedItems.notes.length === 0 && deletedItems.todos.length === 0 ? (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Recycle bin is empty
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {deletedItems.notes.length > 0 && (
                    <div>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</h4>
                      {deletedItems.notes.map(note => (
                        <div key={note.id} className={`mb-2 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-2 mb-2`}>
                            {note.content}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Deleted: {new Date(note.deletedAt).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => restoreItem(note, 'note')}
                                className={`text-xs px-2 py-1 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => permanentlyDelete(note, 'note')}
                                className={`text-xs px-2 py-1 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
                              >
                                Delete Forever
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {deletedItems.todos.length > 0 && (
                    <div>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Todos</h4>
                      {deletedItems.todos.map(todo => (
                        <div key={todo.id} className={`mb-2 p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-2 mb-2 ${todo.completed ? 'line-through' : ''}`}>
                            {todo.text}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Deleted: {new Date(todo.deletedAt).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => restoreItem(todo, 'todo')}
                                className={`text-xs px-2 py-1 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => permanentlyDelete(todo, 'todo')}
                                className={`text-xs px-2 py-1 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
                              >
                                Delete Forever
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <button
                    onClick={emptyRecycleBin}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Empty Recycle Bin
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Note Popup Modal */}
      {showNotePopup && selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowNotePopup(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Note Details</h3>
              <button
                onClick={() => setShowNotePopup(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Content</label>
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => {
                    const updatedNote = { ...selectedNote, content: e.target.value };
                    setSelectedNote(updatedNote);
                    updateNote(selectedNote.id, { content: e.target.value });
                  }}
                  className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={6}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Created</label>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(selectedNote.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmDelete(selectedNote, 'note');
                    setShowNotePopup(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  🗑️ Delete Note
                </button>
                <button
                  onClick={() => setShowNotePopup(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Todo Popup Modal */}
      {showTodoPopup && selectedTodo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTodoPopup(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Todo Details</h3>
              <button
                onClick={() => setShowTodoPopup(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Task</label>
                <input
                  type="text"
                  value={selectedTodo.text}
                  onChange={(e) => {
                    const updatedTodo = { ...selectedTodo, text: e.target.value };
                    setSelectedTodo(updatedTodo);
                    updateTodo(selectedTodo.id, { text: e.target.value });
                  }}
                  className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                  <select
                    value={selectedTodo.priority}
                    onChange={(e) => {
                      const updatedTodo = { ...selectedTodo, priority: e.target.value };
                      setSelectedTodo(updatedTodo);
                      updateTodo(selectedTodo.id, { priority: e.target.value });
                    }}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={selectedTodo.dueDate || ''}
                    onChange={(e) => {
                      const updatedTodo = { ...selectedTodo, dueDate: e.target.value };
                      setSelectedTodo(updatedTodo);
                      updateTodo(selectedTodo.id, { dueDate: e.target.value });
                    }}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subtasks</label>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedTodo.subtasks?.filter(st => st.completed).length || 0}/{selectedTodo.subtasks?.length || 0} completed
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  {selectedTodo.subtasks?.map(subtask => (
                    <div key={subtask.id} className={`flex items-center gap-2 p-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(selectedTodo.id, subtask.id)}
                        className="w-4 h-4"
                      />
                      <span className={`flex-1 text-sm ${subtask.completed ? 'line-through opacity-60' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => deleteSubtask(selectedTodo.id, subtask.id)}
                        className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubtask(selectedTodo.id);
                      }
                    }}
                    placeholder="Add subtask..."
                    className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'} border rounded-lg text-sm`}
                  />
                  <button
                    onClick={() => addSubtask(selectedTodo.id)}
                    disabled={!newSubtask.trim()}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                <button
                  onClick={() => {
                    const updatedTodo = { ...selectedTodo, completed: !selectedTodo.completed };
                    setSelectedTodo(updatedTodo);
                    toggleTodo(selectedTodo.id);
                  }}
                  className={`px-4 py-2 ${selectedTodo.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-lg`}
                >
                  {selectedTodo.completed ? '✓ Mark as Incomplete' : '○ Mark as Complete'}
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmDelete(selectedTodo, 'todo');
                    setShowTodoPopup(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  🗑️ Delete Todo
                </button>
                <button
                  onClick={() => setShowTodoPopup(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Bar */}
      <div 
        className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'} px-6 py-4`}
        onDragOver={handleDragOver}
        onDrop={handleDropOnQuickAccess}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
            ⭐ Quick Access
          </h3>
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Drag items here for quick access
          </span>
        </div>
        <div className={`flex gap-3 overflow-x-auto pb-2 min-h-[5rem] ${darkMode ? 'bg-gray-900/30' : 'bg-gray-100/30'} rounded-xl p-3`}>
          {topNotes.length === 0 && topTodos.length === 0 ? (
            <div className={`flex-1 flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'} text-sm`}>
              Drag notes or todos here for quick access
            </div>
          ) : (
            <>
              {topNotes.map(note => (
                <div
                  key={note.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, note, 'note')}
                  onDragEnd={handleDragEnd}
                  className={`flex-shrink-0 w-40 ${darkMode ? 'bg-gradient-to-br from-yellow-900/50 to-amber-800/50 border-yellow-700' : 'bg-gradient-to-br from-yellow-100 to-amber-50 border-yellow-300'} border rounded-xl p-3 cursor-move`}
                >
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} line-clamp-2`}>
                    {note.content}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    {new Date(note.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              
              {topTodos.map(todo => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo, 'todo')}
                  onDragEnd={handleDragEnd}
                  className={`flex-shrink-0 w-40 ${darkMode ? 'bg-gradient-to-br from-green-900/50 to-emerald-800/50 border-green-700' : 'bg-gradient-to-br from-green-100 to-emerald-50 border-green-300'} border rounded-xl p-3 cursor-move ${todo.completed ? 'opacity-60' : ''}`}
                >
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'} ${todo.completed ? 'line-through' : ''} line-clamp-2`}>
                    {todo.text}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    {todo.priority} priority
                  </p>
                  {todo.subtasks && todo.subtasks.length > 0 && (
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} subtasks
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm border-r ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'} min-h-screen flex flex-col`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'}`}>
            <div className="flex items-center justify-between mb-3">
              {!sidebarCollapsed && (
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tabs</h2>
              )}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-all`}
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? '→' : '←'}
                </button>
                {!sidebarCollapsed && (
                  <button 
                    onClick={() => setShowAddTab(true)}
                    className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                    title="Add New Tab"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            
            {!sidebarCollapsed && (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search tabs..."
                    value={tabSearchTerm}
                    onChange={(e) => setTabSearchTerm(e.target.value)}
                    className={`w-full p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'} border rounded-lg text-sm`}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={collapseAllTabs}
                    className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                  >
                    Collapse All
                  </button>
                  <button
                    onClick={expandAllTabs}
                    className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm`}
                  >
                    Expand All
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {renderTabs()}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-4 mb-6">
            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 shadow-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={noteTemplate}
                  onChange={(e) => {
                    setNoteTemplate(e.target.value);
                    if (e.target.value) {
                      setNewNote(noteTemplates[e.target.value]);
                    }
                  }}
                  className={`p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-200 border-gray-300'} border rounded-lg text-sm`}
                >
                  <option value="">Choose template...</option>
                  <option value="meeting">Meeting Notes</option>
                  <option value="standup">Daily Standup</option>
                  <option value="bug">Bug Report</option>
                  <option value="idea">Idea/Proposal</option>
                </select>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => applyFormatting('bold')}
                    className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-colors`}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    onClick={() => applyFormatting('italic')}
                    className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-colors`}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    onClick={() => applyFormatting('bullet')}
                    className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg`}
                    title="Bullet Point"
                  >
                    •
                  </button>
                </div>
              </div>
              <textarea
                ref={noteInputRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    addNote();
                  }
                }}
                placeholder="Add a new note... (Ctrl+Enter to save)"
                className={`w-full p-3 ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 placeholder-gray-500'} border rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical`}
                style={{ wordBreak: 'break-word' }}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className={`px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 shadow-lg`}>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTodo();
                  }
                }}
                placeholder="Add a new todo... (Enter to save)"
                className={`w-full p-3 ${darkMode ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  className={`px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Add Todo
                </button>
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Overview</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{notes.length}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Notes</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{todos.length}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Todos</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {todos.filter(t => t.completed).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-lg p-3 text-center`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{tabs.length}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tabs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {[
                ['Ctrl + Enter', 'Save note (in note input)'],
                ['Enter', 'Save todo (in todo input)'],
                ['Escape', 'Close modals']
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center">
                  <kbd className={`px-2 py-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded text-sm font-mono`}>{key}</kbd>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Tab Modal */}
      {showAddTab && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddTab(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Tab</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tab Name</label>
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="Enter tab name..."
                  className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parent Tab (Optional)</label>
                <select
                  value={newTabParentId || ''}
                  onChange={(e) => setNewTabParentId(e.target.value || null)}
                  className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                >
                  <option value="">No parent (top level)</option>
                  {tabs.map(tab => (
                    <option key={tab.id} value={tab.id}>{tab.icon} {tab.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewTabIcon(icon)}
                      className={`text-xl p-2 rounded-lg ${newTabIcon === icon ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                <div className="flex gap-2">
                  {['blue', 'green', 'purple', 'red', 'yellow'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTabColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 ${newTabColor === color ? 'ring-2 ring-offset-2' : ''} ${
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'green' ? 'bg-green-500' :
                        color === 'purple' ? 'bg-purple-500' :
                        color === 'red' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addNewTab}
                disabled={!newTabName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tab
              </button>
              <button
                onClick={() => setShowAddTab(false)}
                className={`flex-1 px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Details Modal */}
      {showTabDetails && editingTab && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTabDetails(false)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tab Settings: {editingTab.name}</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tab Name</label>
                  <input
                    type="text"
                    value={editingTab.name}
                    onChange={(e) => setEditingTab({ ...editingTab, name: e.target.value })}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parent Tab</label>
                  <select
                    value={editingTab.parentId || ''}
                    onChange={(e) => setEditingTab({ ...editingTab, parentId: e.target.value || null })}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  >
                    <option value="">No parent (top level)</option>
                    {tabs.filter(tab => tab.id !== editingTab.id).map(tab => (
                      <option key={tab.id} value={tab.id}>{tab.icon} {tab.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.slice(0, 10).map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditingTab({ ...editingTab, icon })}
                        className={`text-xl p-2 rounded-lg ${editingTab.icon === icon ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900' : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                  <div className="flex gap-2">
                    {['blue', 'green', 'purple', 'red', 'yellow'].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingTab({ ...editingTab, color })}
                        className={`w-10 h-10 rounded-lg border-2 ${editingTab.color === color ? 'ring-2 ring-offset-2' : ''} ${
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'green' ? 'bg-green-500' :
                          color === 'purple' ? 'bg-purple-500' :
                          color === 'red' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Contact Information</h4>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    👤 Point of Contact
                  </label>
                  <input
                    type="text"
                    value={editingTab.details?.pointOfContact || ''}
                    onChange={(e) => setEditingTab({
                      ...editingTab,
                      details: { ...editingTab.details, pointOfContact: e.target.value }
                    })}
                    placeholder="Contact name..."
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={editingTab.details?.email || ''}
                    onChange={(e) => setEditingTab({
                      ...editingTab,
                      details: { ...editingTab.details, email: e.target.value }
                    })}
                    placeholder="contact@example.com"
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📞 Phone
                  </label>
                  <input
                    type="tel"
                    value={editingTab.details?.phone || ''}
                    onChange={(e) => setEditingTab({
                      ...editingTab,
                      details: { ...editingTab.details, phone: e.target.value }
                    })}
                    placeholder="+1 234 567 8900"
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📝 Description
                  </label>
                  <textarea
                    value={editingTab.details?.description || ''}
                    onChange={(e) => setEditingTab({
                      ...editingTab,
                      details: { ...editingTab.details, description: e.target.value }
                    })}
                    placeholder="Tab description..."
                    rows={3}
                    className={`w-full p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg resize-none`}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Custom Fields</h4>
                
                {editingTab.details?.customFields?.map(field => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-lg">{field.icon}</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} min-w-[100px]`}>
                      {field.key}:
                    </span>
                    <span className={`flex-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {field.value}
                    </span>
                    <button
                      onClick={() => removeCustomField(field.id)}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                    >
                      ❌
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <select
                    value={newCustomField.icon}
                    onChange={(e) => setNewCustomField({ ...newCustomField, icon: e.target.value })}
                    className={`p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg text-sm`}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newCustomField.key}
                    onChange={(e) => setNewCustomField({ ...newCustomField, key: e.target.value })}
                    placeholder="Field name..."
                    className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg text-sm`}
                  />
                  <input
                    type="text"
                    value={newCustomField.value}
                    onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
                    placeholder="Field value..."
                    className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg text-sm`}
                  />
                  <button
                    onClick={addCustomField}
                    disabled={!newCustomField.key || !newCustomField.value}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                {editingTab.id !== 'general' && (
                  <button
                    onClick={() => deleteTab(editingTab.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    🗑️ Delete Tab
                  </button>
                )}
                <button
                  onClick={() => {
                    saveTabDetails();
                    setShowTabDetails(false);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowTabDetails(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectLightspeed;
