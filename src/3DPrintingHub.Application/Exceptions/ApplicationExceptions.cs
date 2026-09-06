namespace _3DPrintingHub.Application.Exceptions;

public abstract class ApplicationExceptionBase(string message) : Exception(message);

public sealed class ResourceNotFoundException(string message) : ApplicationExceptionBase(message);

public sealed class ResourceConflictException(string message) : ApplicationExceptionBase(message);

public sealed class BusinessRuleException(string message) : ApplicationExceptionBase(message);