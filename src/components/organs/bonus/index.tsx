"use client"
import React, { useEffect } from 'react';

const BonusView: React.FC = () => {
    useEffect(() => {
        // Load jQuery
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            // jQuery code runs after jQuery is loaded
            const $ = (window as any).$;
            let itemId = 0;

            // Add item function
            function addItem() {
                const inputVal = String($('#itemInput').val() || '').trim();
                
                if (inputVal === '') {
                    showError();
                    return;
                }

                // Remove empty state if exists
                $('.empty-state').remove();

                // Create new list item
                const newItem = $(`
                    <li class="list-item" data-id="${itemId++}">
                        <span class="item-text">${inputVal}</span>
                        <button class="delete-btn">Delete</button>
                    </li>
                `);

                $('#itemList').append(newItem);
                $('#itemInput').val('');
                $('#itemInput').focus();
            }

            // Show error message with fade out after 2 seconds
            function showError() {
                const $error = $('#errorMessage');
                $error.removeClass('show');
                void $error[0].offsetWidth; 
                
                $error.addClass('show');
                
                setTimeout(() => {
                    $error.removeClass('show');
                }, 2000);
            }

            // Delete item with fade animation
            function deleteItem($item: any) {
                $item.addClass('fade-out');
                setTimeout(() => {
                    $item.remove();
                    
                    // Show empty state if no items left
                    if ($('#itemList .list-item').length === 0) {
                        $('#itemList').html('<li class="empty-state">No items yet. Add one above!</li>');
                    }
                }, 300);
            }

            // Event listeners
            $('#addBtn').off('click').on('click', addItem);
            
            $('#itemInput').off('keypress').on('keypress', function(e: any) {
                if (e.which === 13) {
                    addItem();
                }
            });

            $('#itemList').off('click').on('click', '.delete-btn', function(this: HTMLElement) {
                deleteItem($(this).closest('.list-item'));
            });

            // Initialize empty state
            if ($('#itemList .list-item').length === 0) {
                $('#itemList').html('<li class="empty-state">No items yet. Add one above!</li>');
            }
        };

        // Cleanup
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={styles.h1}>My Todo List</h1>
                
                <div style={styles.inputSection}>
                    <input 
                        type="text" 
                        id="itemInput" 
                        placeholder="Enter a new item..."
                        style={styles.input}
                    />
                    <button id="addBtn" style={styles.addBtn}>Add</button>
                </div>

                <div id="errorMessage" style={styles.errorMessage}>
                    Please enter an item
                </div>

                <ul id="itemList" style={styles.itemList}>
                    <li style={styles.emptyState}>No items yet. Add one above!</li>
                </ul>
            </div>

            <style>{`
                .error-message.show {
                    display: block !important;
                    animation: fadeOut 2s ease-in-out;
                }

                @keyframes fadeOut {
                    0% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f8f9fa;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    list-style: none;
                }

                .list-item:hover {
                    background: #e9ecef;
                    transform: translateX(5px);
                }

                .list-item.fade-out {
                    opacity: 0;
                    transform: scale(0.95);
                }

                .item-text {
                    flex: 1;
                    color: #333;
                    font-size: 16px;
                }

                .delete-btn {
                    padding: 8px 16px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: background 0.3s;
                }

                .delete-btn:hover {
                    background: #c82333;
                }

                .empty-state {
                    text-align: center;
                    color: #999;
                    padding: 40px;
                    font-size: 16px;
                    list-style: none;
                }
                .show{
                    display: block !important;
                }
            `}</style>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    body: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '40px 20px',
        color: 'black',
    },
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        padding: '30px',
    },
    h1: {
        color: '#333',
        marginBottom: '30px',
        fontSize: '32px',
        marginTop: 0,
    },
    inputSection: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'border-color 0.3s',
    },
    addBtn: {
        padding: '12px 24px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.3s',
    },
    errorMessage: {
        background: '#fee',
        color: '#c33',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #c33',
        display: 'none',
    },
    itemList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    emptyState: {
        textAlign: 'center',
        color: '#999',
        padding: '40px',
        fontSize: '16px',
        listStyle: 'none',
    },
};

export default BonusView;