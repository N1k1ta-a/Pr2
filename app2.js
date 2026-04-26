const API_URL = 'http://127.0.0.1:8000/api';

// Переключение вкладок
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'participants') {
        loadParticipants();
    } else if (tabName === 'competitions') {
        loadCompetitions();
    }
}

// API запросы
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Загрузка участников
async function loadParticipants() {
    try {
        const participants = await apiRequest('/participants');
        displayParticipants(participants);
        updateStats(participants);
    } catch (error) {
        console.error('Failed to load participants:', error);
        document.getElementById('participants-list').innerHTML = 
            '<p style="color: red;">Ошибка загрузки участников. Убедитесь, что бекенд запущен.</p>';
    }
}

// Отображение участников
function displayParticipants(participants) {
    const container = document.getElementById('participants-list');
    if (!container) return;
    
    if (participants.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Нет участников. Добавьте первого!</p>';
        return;
    }
    
    container.innerHTML = '';
    participants.forEach(participant => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.innerHTML = `
            <h3>${escapeHtml(participant.name)}</h3>
            <p>🏢 Команда: ${escapeHtml(participant.team)}</p>
            <p>⭐ Счёт: <strong>${participant.score}</strong></p>
            <p>📅 Дата регистрации: ${new Date(participant.created_at).toLocaleDateString()}</p>
            <button class="edit" onclick="editParticipant(${participant.id})">✏️ Редактировать</button>
            <button onclick="deleteParticipant(${participant.id})">🗑️ Удалить</button>
        `;
        container.appendChild(card);
    });
}

// Обновление статистики
function updateStats(participants) {
    const total = participants.length;
    const average = total > 0 
        ? (participants.reduce((sum, p) => sum + p.score, 0) / total).toFixed(2)
        : 0;
    
    document.getElementById('total-participants').textContent = total;
    document.getElementById('average-score').textContent = average;
}

// Добавление участника
async function addParticipant(name, team, score) {
    try {
        await apiRequest('/participants', 'POST', { name, team, score: parseFloat(score) });
        await loadParticipants();
        return true;
    } catch (error) {
        console.error('Failed to add participant:', error);
        alert('Ошибка при добавлении участника');
        return false;
    }
}

// Редактирование участника
async function editParticipant(id) {
    const newScore = prompt('Введите новый счёт:');
    if (newScore !== null) {
        try {
            const participant = await apiRequest(`/participants/${id}`);
            await apiRequest(`/participants/${id}`, 'PUT', {
                name: participant.name,
                team: participant.team,
                score: parseFloat(newScore)
            });
            await loadParticipants();
        } catch (error) {
            console.error('Failed to update participant:', error);
            alert('Ошибка при обновлении');
        }
    }
}

// Удаление участника
async function deleteParticipant(id) {
    if (confirm('Вы уверены, что хотите удалить этого участника?')) {
        try {
            await apiRequest(`/participants/${id}`, 'DELETE');
            await loadParticipants();
        } catch (error) {
            console.error('Failed to delete participant:', error);
            alert('Ошибка при удалении');
        }
    }
}

// Загрузка соревнований
async function loadCompetitions() {
    try {
        const competitions = await apiRequest('/competitions');
        displayCompetitions(competitions);
    } catch (error) {
        console.error('Failed to load competitions:', error);
        document.getElementById('competitions-list').innerHTML = 
            '<p style="color: red;">Ошибка загрузки соревнований</p>';
    }
}

// Отображение соревнований
function displayCompetitions(competitions) {
    const container = document.getElementById('competitions-list');
    if (!container) return;
    
    if (competitions.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Нет соревнований. Создайте первое!</p>';
        return;
    }
    
    container.innerHTML = '';
    competitions.forEach(competition => {
        const card = document.createElement('div');
        card.className = 'competition-card';
        const statusText = {
            'active': '🟢 Активное',
            'completed': '✅ Завершённое',
            'cancelled': '🔴 Отменённое'
        }[competition.status] || competition.status;
        
        card.innerHTML = `
            <h3>${escapeHtml(competition.title)}</h3>
            <p>📅 Дата: ${new Date(competition.date).toLocaleString()}</p>
            <p>📊 Статус: ${statusText}</p>
            <button onclick="editCompetition(${competition.id})">✏️ Редактировать</button>
            <button onclick="deleteCompetition(${competition.id})">🗑️ Удалить</button>
        `;
        container.appendChild(card);
    });
}

// Создание соревнования
async function createCompetition(title, date, status) {
    try {
        await apiRequest('/competitions', 'POST', { title, date, status });
        await loadCompetitions();
        return true;
    } catch (error) {
        console.error('Failed to create competition:', error);
        alert('Ошибка при создании соревнования');
        return false;
    }
}

// Редактирование соревнования
async function editCompetition(id) {
    const newTitle = prompt('Введите новое название:');
    if (newTitle) {
        try {
            const competition = await apiRequest(`/competitions/${id}`);
            await apiRequest(`/competitions/${id}`, 'PUT', {
                title: newTitle,
                date: competition.date,
                status: competition.status
            });
            await loadCompetitions();
        } catch (error) {
            console.error('Failed to update competition:', error);
            alert('Ошибка при обновлении');
        }
    }
}

// Удаление соревнования
async function deleteCompetition(id) {
    if (confirm('Вы уверены, что хотите удалить это соревнование?')) {
        try {
            await apiRequest(`/competitions/${id}`, 'DELETE');
            await loadCompetitions();
        } catch (error) {
            console.error('Failed to delete competition:', error);
            alert('Ошибка при удалении');
        }
    }
}

// Вспомогательная функция для защиты от XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Обработчики форм
document.addEventListener('DOMContentLoaded', () => {
    // Форма добавления участника
    const participantForm = document.getElementById('add-participant-form');
    if (participantForm) {
        participantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('participant-name').value;
            const team = document.getElementById('participant-team').value;
            const score = document.getElementById('participant-score').value;
            await addParticipant(name, team, score);
            participantForm.reset();
        });
    }
    
    // Форма создания соревнования
    const competitionForm = document.getElementById('add-competition-form');
    if (competitionForm) {
        competitionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('competition-title').value;
            const date = document.getElementById('competition-date').value;
            const status = document.getElementById('competition-status').value;
            await createCompetition(title, date, status);
            competitionForm.reset();
        });
    }
    
    // Загрузка начальных данных
    loadParticipants();
});
