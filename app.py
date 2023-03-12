from flask import Flask, render_template
from flask_socketio import SocketIO


app = Flask(__name__)
socketio = SocketIO(app, logger=True, engineio_logger=True)


@app.route('/')
def hello_world():  # put application's code here
    return render_template('index.html')


@socketio.on('connect')
def handle_message(data):
    socketio.emit('message')
    print('New connection! + ' + str(data))


if __name__ == '__main__':
    print('iiii')
    socketio.run(app)
