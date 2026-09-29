namespace _3DPrintingHub.Domain.Exceptions;

public abstract class DomainExceptionBase(string message) : Exception(message);

public sealed class BusinessRuleException(string message) : DomainExceptionBase(message);
