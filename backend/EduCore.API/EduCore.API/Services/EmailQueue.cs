using System.Threading.Channels;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;

namespace EduCore.API.Services;

public class EmailQueue : IEmailQueue
{
    private readonly Channel<EmailItem> _channel;

    public EmailQueue()
    {
        var options = new UnboundedChannelOptions
        {
            SingleReader = true
        };
        _channel = Channel.CreateUnbounded<EmailItem>(options);
    }

    public void QueueEmail(EmailItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        _channel.Writer.TryWrite(item);
    }

    public ValueTask<EmailItem> DequeueAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAsync(cancellationToken);
    }
}
